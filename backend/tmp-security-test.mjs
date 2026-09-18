import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q = async (s, a) => (await pool.query(s, a)).rows;

const BASE = 'http://localhost:8000/api/v1';
const results = [];

function check(name, got, expected) {
  const ok = expected.includes(got);
  results.push({ name, got, expected, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (got ${got}, want ${expected.join('/')})`);
}

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return { status: res.status, token: body?.data?.accessToken, user: body?.data?.user };
}

async function req(method, path, token, body) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

async function main() {
  const gy = (await q("select id from schools where code='GYAN001'"))[0].id;
  const gps = (await q("select id from schools where code='GPS001'"))[0].id;
  const subject = (await q('select id from subjects where school_id=$1 and code=$2', [gy, 'MATH']))[0];
  const academic = (await q("select id from academic_years where school_id=$1 and is_current=true", [gy]))[0];
  const students = await q('select s.id, s.user_id, u.email from students s join users u on u.id=s.user_id where s.school_id=$1', [gy]);
  const byEmail = (e) => students.find((s) => s.email === e);
  const student1 = byEmail('student1@gyannportal.com');
  const student2 = byEmail('student2@gyannportal.com');
  const student4 = byEmail('student4@gyannportal.com');
  const tcs = await q('select tc.class_id,tc.section_id,tc.subject_id,u.email from teacher_classes tc join teachers t on t.id=tc.teacher_id join users u on u.id=t.user_id where tc.school_id=$1', [gy]);
  const tcTeacher1 = tcs.find((t) => t.email === 'teacher1@gyannportal.com');
  const tcTeacher2 = tcs.find((t) => t.email === 'teacher2@gyannportal.com');
  const t1ClassIds = new Set(
    tcs.filter((t) => t.email === 'teacher1@gyannportal.com').map((t) => t.class_id),
  );
  const tcTeacher2Only = tcs.find(
    (t) => t.email === 'teacher2@gyannportal.com' && !t1ClassIds.has(t.class_id),
  );
  const suspendedUserId = (await q("select id from users where email='parent@gyannportal.com'"))[0]?.id;

  // ---- tokens ----
  const superA = await login('superadmin@gyannportal.com', 'SuperAdmin@123');
  const sadmin = await login('schooladmin@gyannportal.com', 'Demo@123');
  const t1 = await login('teacher1@gyannportal.com', 'Demo@123');
  const t2 = await login('teacher2@gyannportal.com', 'Demo@123');
  const p1 = await login('parent1@gyannportal.com', 'Demo@123');
  const p2 = await login('parent2@gyannportal.com', 'Demo@123');
  const s1 = await login('student1@gyannportal.com', 'Demo@123');
  const s2 = await login('student2@gyannportal.com', 'Demo@123');

  console.log('\n--- AUTH ---');
  check('all demo logins succeed', [superA.status, sadmin.status, t1.status, t2.status, p1.status, p2.status, s1.status, s2.status].every((s) => s === 200) ? 200 : 0, [200]);

  // 10. unauthenticated
  check('unauthenticated GET /schools -> 401', (await req('GET', '/schools')).status, [401]);

  // 1. super admin all schools
  const allSchools = await req('GET', '/schools', superA.token);
  const allCount = allSchools.json?.data?.length ?? -1;
  check('SUPER_ADMIN sees all schools (>=2)', allCount >= 2 ? 200 : 0, [200]);

  // 2. school admin own school only
  const ownSchools = await req('GET', '/schools', sadmin.token);
  const ownOnly = (ownSchools.json?.data ?? []).every((s) => s.id === gy);
  check('SCHOOL_ADMIN list scoped to own school', ownSchools.status === 200 && ownOnly ? 200 : 0, [200]);

  // 3. school admin cannot access another school
  check('SCHOOL_ADMIN GET other school -> 403', (await req('GET', `/schools/${gps}`, sadmin.token)).status, [403]);

  // 11. wrong role
  check('PARENT POST /schools -> 403', (await req('POST', '/schools', p1.token, { name: 'x', code: 'X' })).status, [403]);

  console.log('\n--- ROUTE ORDER FIXES (me not shadowed) ---');
  check('TEACHER GET /teachers/me -> 200', (await req('GET', '/teachers/me', t1.token)).status, [200]);
  check('STUDENT GET /students/me -> 200', (await req('GET', '/students/me', s1.token)).status, [200]);

  console.log('\n--- PARENT CHILD ISOLATION ---');
  check('PARENT1 GET own child profile -> 200', (await req('GET', `/parents/me/children/${student1.id}`, p1.token)).status, [200]);
  check('PARENT1 GET other parent child -> 403', (await req('GET', `/parents/me/children/${student4.id}`, p1.token)).status, [403]);

  console.log('\n--- RESULTS ISOLATION ---');
  // ensure an exam
  let exam = (await q('select id from exams where school_id=$1 limit 1', [gy]))[0];
  if (!exam) {
    const created = await req('POST', '/exams', sadmin.token, {
      name: 'Security Test Exam',
      academicYearId: academic.id,
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    });
    exam = { id: created.json?.data?.id };
  }
  const teacher1Row = (await q('select id from teachers where school_id=$1 and user_id=(select id from users where email=$2)', [gy, 'teacher1@gyannportal.com']))[0];

  const createdResult = await req('POST', '/results', sadmin.token, {
    studentId: student1.id,
    examId: exam.id,
    subjectId: subject.id,
    teacherId: teacher1Row.id,
    marks: 88,
    grade: 'A',
  });
  const rid = createdResult.json?.data?.id;
  check('SCHOOL_ADMIN create result -> 201', createdResult.status, [201]);

  if (rid) {
    check('PARENT1 (own child) GET result -> 200', (await req('GET', `/results/${rid}`, p1.token)).status, [200]);
    check('PARENT2 (other child) GET result -> 403', (await req('GET', `/results/${rid}`, p2.token)).status, [403]);
    check('STUDENT1 (owner) GET result -> 200', (await req('GET', `/results/${rid}`, s1.token)).status, [200]);
    check('STUDENT2 (other) GET result -> 403', (await req('GET', `/results/${rid}`, s2.token)).status, [403]);
    check('TEACHER1 (author) GET result -> 200', (await req('GET', `/results/${rid}`, t1.token)).status, [200]);
    check('TEACHER2 (not author) GET result -> 403', (await req('GET', `/results/${rid}`, t2.token)).status, [403]);
    check('TEACHER2 (not author) PATCH result -> 403', (await req('PATCH', `/results/${rid}`, t2.token, { marks: 1 })).status, [403]);
    check('TEACHER1 (author) PATCH result -> 200', (await req('PATCH', `/results/${rid}`, t1.token, { marks: 90 })).status, [200]);
  }

  console.log('\n--- ATTENDANCE TEACHER ASSIGNMENT ---');
  if (tcTeacher1 && tcTeacher2) {
    const records = [{ studentId: student1.id, status: 'PRESENT' }];
    const dto1 = { classId: tcTeacher1.class_id, sectionId: tcTeacher1.section_id, date: '2026-09-10', records };
    const dto2 = { classId: tcTeacher2.class_id, sectionId: tcTeacher2.section_id, date: '2026-09-10', records };
    const t1marksOwn = await req('POST', '/attendance', t1.token, dto1);
    check('TEACHER1 marks own assigned class -> 201', t1marksOwn.status, [201]);
    if (tcTeacher2Only) {
      const dtoT2 = { classId: tcTeacher2Only.class_id, sectionId: tcTeacher2Only.section_id, date: '2026-09-10', records };
      const t1marksT2 = await req('POST', '/attendance', t1.token, dtoT2);
      check('TEACHER1 marks TEACHER2-only class -> 403', t1marksT2.status, [403]);
    } else {
      check('teacher2-only class exists', 0, [200]);
    }
  } else {
    check('teacherClass assignments present', 0, [200]);
  }

  console.log('\n--- FILES USER/TENANT ISOLATION ---');
  const fd = new FormData();
  fd.append('file', new Blob([Buffer.from('hello student1')], { type: 'text/plain' }), 'student1-note.txt');
  const up1 = await req('POST', '/files/upload', s1.token, fd);
  const fileId = up1.json?.data?.id;
  check('STUDENT1 upload file -> 201', up1.status, [201]);
  if (fileId) {
    check('STUDENT2 GET student1 file by id -> 403', (await req('GET', `/files/${fileId}`, s2.token)).status, [403]);
    const list = await req('GET', `/files?userId=${student1.user_id}`, s2.token);
    const leaked = (list.json?.data ?? []).some((f) => f.id === fileId);
    check('STUDENT2 list with forged userId does not leak -> 200/no-leak', list.status === 200 && !leaked ? 200 : 0, [200]);
  }

  console.log('\n--- SUSPENDED USER LOGIN ---');
  if (suspendedUserId) {
    const susp = await req('PATCH', `/super-admin/users/${suspendedUserId}/status`, superA.token, { status: 'SUSPENDED' });
    check('SUPER_ADMIN suspend user -> 200', susp.status, [200]);
    const denied = await login('parent@gyannportal.com', 'Demo@123');
    check('SUSPENDED user login denied -> 401', denied.status, [401]);
    await req('PATCH', `/super-admin/users/${suspendedUserId}/status`, superA.token, { status: 'ACTIVE' });
  } else {
    check('suspended test user present', 0, [200]);
  }

  console.log('\n================ SUMMARY ================');
  const passed = results.filter((r) => r.ok).length;
  console.log(`${passed}/${results.length} passed`);
  const failures = results.filter((r) => !r.ok);
  if (failures.length) {
    console.log('FAILURES:');
    for (const f of failures) console.log(`  - ${f.name}: got ${f.got}, want ${f.expected.join('/')}`);
  }
  await pool.end();
  process.exit(failures.length ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
