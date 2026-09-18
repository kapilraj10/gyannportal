import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

import {
  AcademicYearStatus,
  BranchStatus,
  ClassStatus,
  CourseStatus,
  EnrollmentStatus,
  Gender,
  ParentChildRelationship,
  ParentStatus,
  PrismaClient,
  SchoolLevel,
  SchoolStatus,
  SchoolType,
  SectionStatus,
  StudentStatus,
  SubjectStatus,
  TeacherStatus,
  UserStatus,
} from '../src/generated/prisma/client.js';

import { ALL_PERMISSIONS, Permission } from '../src/common/enums/permission.enum.js';
import { ALL_ROLES, Role } from '../src/common/enums/role.enum.js';

function createPrismaAdapter() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL');
  }

  return new PrismaPg({ connectionString });
}

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

// ============================================================
// PASSWORDS — never hard-code production credentials
// ============================================================

const SUPER_ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? 'SuperAdmin@123';

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'Demo@123';

// ============================================================
// ROLE → PERMISSION MATRIX
// ============================================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: ALL_PERMISSIONS,

  [Role.SCHOOL_ADMIN]: [
    Permission.SCHOOL_READ,
    Permission.SCHOOL_UPDATE,
    Permission.USER_READ,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.STUDENT_READ,
    Permission.STUDENT_CREATE,
    Permission.STUDENT_UPDATE,
    Permission.STUDENT_DELETE,
    Permission.TEACHER_READ,
    Permission.TEACHER_CREATE,
    Permission.TEACHER_UPDATE,
    Permission.TEACHER_DELETE,
    Permission.PARENT_READ,
    Permission.PARENT_CREATE,
    Permission.PARENT_UPDATE,
    Permission.PARENT_DELETE,
    Permission.CLASS_READ,
    Permission.CLASS_CREATE,
    Permission.CLASS_UPDATE,
    Permission.CLASS_DELETE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_UPDATE,
    Permission.ASSIGNMENT_READ,
    Permission.ASSIGNMENT_CREATE,
    Permission.ASSIGNMENT_UPDATE,
    Permission.ASSIGNMENT_DELETE,
    Permission.EXAM_READ,
    Permission.EXAM_CREATE,
    Permission.EXAM_UPDATE,
    Permission.EXAM_DELETE,
    Permission.RESULT_READ,
    Permission.RESULT_CREATE,
    Permission.RESULT_UPDATE,
    Permission.NOTIFICATION_READ,
    Permission.NOTIFICATION_CREATE,
    Permission.AUDIT_LOG_READ,
  ],

  [Role.TEACHER]: [
    Permission.STUDENT_READ,
    Permission.CLASS_READ,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_CREATE,
    Permission.ATTENDANCE_UPDATE,
    Permission.ASSIGNMENT_READ,
    Permission.ASSIGNMENT_CREATE,
    Permission.ASSIGNMENT_UPDATE,
    Permission.EXAM_READ,
    Permission.RESULT_READ,
    Permission.RESULT_CREATE,
    Permission.RESULT_UPDATE,
    Permission.NOTIFICATION_READ,
    Permission.NOTIFICATION_CREATE,
  ],

  [Role.PARENT]: [
    Permission.STUDENT_READ,
    Permission.CLASS_READ,
    Permission.ATTENDANCE_READ,
    Permission.ASSIGNMENT_READ,
    Permission.EXAM_READ,
    Permission.RESULT_READ,
    Permission.NOTIFICATION_READ,
  ],

  [Role.STUDENT]: [
    Permission.STUDENT_READ,
    Permission.CLASS_READ,
    Permission.ATTENDANCE_READ,
    Permission.ASSIGNMENT_READ,
    Permission.EXAM_READ,
    Permission.RESULT_READ,
    Permission.NOTIFICATION_READ,
  ],
};

async function main() {
  console.log('Seeding GyannPortal database...');

  // ========================================
  // PERMISSIONS
  // ========================================

  for (const name of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Remove legacy permission names that predate the Permission enum.
  await prisma.permission.deleteMany({
    where: { name: { notIn: ALL_PERMISSIONS } },
  });

  // ========================================
  // ROLES
  // ========================================

  const roles = new Map<Role, { id: string; name: string }>();

  for (const name of ALL_ROLES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles.set(name, role);
  }

  // ========================================
  // ROLE → PERMISSION MAPPING
  // ========================================

  const permissions = await prisma.permission.findMany();
  const permissionIdByName = new Map(
    permissions.map((permission) => [permission.name, permission.id]),
  );

  for (const role of ALL_ROLES) {
    const roleRecord = roles.get(role)!;
    const desired = ROLE_PERMISSIONS[role];

    await prisma.rolePermission.deleteMany({
      where: { roleId: roleRecord.id },
    });

    await prisma.rolePermission.createMany({
      data: desired
        .map((name) => permissionIdByName.get(name))
        .filter((permissionId): permissionId is string => Boolean(permissionId))
        .map((permissionId) => ({
          roleId: roleRecord.id,
          permissionId,
        })),
      skipDuplicates: true,
    });
  }

  // ========================================
  // DEMO SCHOOL
  // ========================================

  const school = await prisma.school.upsert({
    where: { code: 'GYAN001' },
    update: {
      name: 'Demo School',
      status: SchoolStatus.ACTIVE,
    },
    create: {
      name: 'Demo School',
      code: 'GYAN001',
      registrationNumber: 'DEMO-REG-001',
      schoolType: SchoolType.PRIVATE,
      level: SchoolLevel.SECONDARY,
      establishedYear: 2020,
      email: 'info@demoschool.gyannportal.com',
      phone: '9800000000',
      website: 'https://demoschool.gyannportal.com',
      address: 'Kathmandu, Nepal',
      status: SchoolStatus.ACTIVE,
    },
  });

  // ========================================
  // BRANCH
  // ========================================

  const branch = await prisma.branch.upsert({
    where: { schoolId_name: { schoolId: school.id, name: 'Main Branch' } },
    update: { status: BranchStatus.ACTIVE },
    create: {
      schoolId: school.id,
      name: 'Main Branch',
      address: 'Kathmandu, Nepal',
      phone: '9800000000',
      status: BranchStatus.ACTIVE,
    },
  });

  // ========================================
  // ACADEMIC YEARS (only one current)
  // ========================================

  const currentYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2026/27' } },
    update: { isCurrent: true, status: AcademicYearStatus.ACTIVE },
    create: {
      schoolId: school.id,
      name: '2026/27',
      startDate: new Date('2026-04-14'),
      endDate: new Date('2027-04-13'),
      isCurrent: true,
      status: AcademicYearStatus.ACTIVE,
    },
  });

  await prisma.academicYear.updateMany({
    where: { schoolId: school.id, isCurrent: true, NOT: { id: currentYear.id } },
    data: { isCurrent: false },
  });

  await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2025/26' } },
    update: { isCurrent: false, status: AcademicYearStatus.COMPLETED },
    create: {
      schoolId: school.id,
      name: '2025/26',
      startDate: new Date('2025-04-14'),
      endDate: new Date('2026-04-13'),
      isCurrent: false,
      status: AcademicYearStatus.COMPLETED,
    },
  });

  // ========================================
  // USERS
  // ========================================

  async function upsertUser(input: {
    email: string;
    name: string;
    password: string;
    role: Role;
    phone?: string;
    gender?: Gender;
  }) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);
    const roleId = roles.get(input.role)!.id;

    return prisma.user.upsert({
      where: { email },
      update: {
        name: input.name,
        passwordHash,
        roleId,
        schoolId: school.id,
        branchId: branch.id,
        status: UserStatus.ACTIVE,
      },
      create: {
        schoolId: school.id,
        branchId: branch.id,
        name: input.name,
        email,
        phone: input.phone,
        passwordHash,
        roleId,
        gender: input.gender,
        status: UserStatus.ACTIVE,
      },
    });
  }

  const superAdmin = await upsertUser({
    name: 'Platform Super Admin',
    email: 'superadmin@gyannportal.com',
    password: SUPER_ADMIN_PASSWORD,
    role: Role.SUPER_ADMIN,
  });

  const schoolAdmin = await upsertUser({
    name: 'Ramesh Shrestha',
    email: 'schooladmin@gyannportal.com',
    password: DEMO_PASSWORD,
    role: Role.SCHOOL_ADMIN,
    phone: '9800000001',
    gender: Gender.MALE,
  });

  const teacherUser1 = await upsertUser({
    name: 'Anita Gurung',
    email: 'teacher1@gyannportal.com',
    password: DEMO_PASSWORD,
    role: Role.TEACHER,
    phone: '9800000002',
    gender: Gender.FEMALE,
  });

  const teacherUser2 = await upsertUser({
    name: 'Bikash Karki',
    email: 'teacher2@gyannportal.com',
    password: DEMO_PASSWORD,
    role: Role.TEACHER,
    phone: '9800000003',
    gender: Gender.MALE,
  });

  const parentUser1 = await upsertUser({
    name: 'Sita Thapa',
    email: 'parent1@gyannportal.com',
    password: DEMO_PASSWORD,
    role: Role.PARENT,
    phone: '9800000004',
    gender: Gender.FEMALE,
  });

  const parentUser2 = await upsertUser({
    name: 'Hari Lama',
    email: 'parent2@gyannportal.com',
    password: DEMO_PASSWORD,
    role: Role.PARENT,
    phone: '9800000005',
    gender: Gender.MALE,
  });

  const studentUsers = await Promise.all(
    [
      { name: 'Aayush Thapa', email: 'student1@gyannportal.com', gender: Gender.MALE },
      { name: 'Bina Thapa', email: 'student2@gyannportal.com', gender: Gender.FEMALE },
      { name: 'Chirag Thapa', email: 'student3@gyannportal.com', gender: Gender.MALE },
      { name: 'Dipesh Lama', email: 'student4@gyannportal.com', gender: Gender.MALE },
      { name: 'Eva Lama', email: 'student5@gyannportal.com', gender: Gender.FEMALE },
    ].map((student) =>
      upsertUser({
        ...student,
        password: DEMO_PASSWORD,
        role: Role.STUDENT,
        phone: '9800000006',
      }),
    ),
  );

  // ========================================
  // TEACHER PROFILES
  // ========================================

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacherUser1.id },
    update: { employeeCode: 'TCH-001', status: TeacherStatus.ACTIVE },
    create: {
      userId: teacherUser1.id,
      schoolId: school.id,
      employeeCode: 'TCH-001',
      qualification: 'M.Sc. Mathematics',
      joiningDate: new Date('2022-04-01'),
      status: TeacherStatus.ACTIVE,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacherUser2.id },
    update: { employeeCode: 'TCH-002', status: TeacherStatus.ACTIVE },
    create: {
      userId: teacherUser2.id,
      schoolId: school.id,
      employeeCode: 'TCH-002',
      qualification: 'M.A. English',
      joiningDate: new Date('2023-04-01'),
      status: TeacherStatus.ACTIVE,
    },
  });

  // ========================================
  // PARENT PROFILES
  // ========================================

  const parent1 = await prisma.parent.upsert({
    where: { userId: parentUser1.id },
    update: { status: ParentStatus.ACTIVE },
    create: {
      userId: parentUser1.id,
      schoolId: school.id,
      occupation: 'Teacher',
      address: 'Kathmandu, Nepal',
      status: ParentStatus.ACTIVE,
    },
  });

  const parent2 = await prisma.parent.upsert({
    where: { userId: parentUser2.id },
    update: { status: ParentStatus.ACTIVE },
    create: {
      userId: parentUser2.id,
      schoolId: school.id,
      occupation: 'Engineer',
      address: 'Lalitpur, Nepal',
      status: ParentStatus.ACTIVE,
    },
  });

  // ========================================
  // STUDENT PROFILES
  // ========================================

  const studentCodes = ['STU-001', 'STU-002', 'STU-003', 'STU-004', 'STU-005'];

  const students = await Promise.all(
    studentUsers.map((user, index) =>
      prisma.student.upsert({
        where: { userId: user.id },
        update: { studentCode: studentCodes[index], status: StudentStatus.ACTIVE },
        create: {
          userId: user.id,
          schoolId: school.id,
          studentCode: studentCodes[index],
          dateOfBirth: new Date(`201${index}-05-10`),
          gender: user.gender ?? Gender.OTHER,
          address: 'Kathmandu, Nepal',
          admissionDate: new Date('2026-04-15'),
          status: StudentStatus.ACTIVE,
        },
      }),
    ),
  );

  // ========================================
  // PARENT ↔ STUDENT RELATIONSHIPS
  // ========================================

  const links: Array<{
    parentId: string;
    studentId: string;
    relationship: ParentChildRelationship;
    isPrimary: boolean;
  }> = [
    { parentId: parent1.id, studentId: students[0].id, relationship: ParentChildRelationship.MOTHER, isPrimary: true },
    { parentId: parent1.id, studentId: students[1].id, relationship: ParentChildRelationship.MOTHER, isPrimary: true },
    { parentId: parent1.id, studentId: students[2].id, relationship: ParentChildRelationship.MOTHER, isPrimary: true },
    { parentId: parent2.id, studentId: students[3].id, relationship: ParentChildRelationship.FATHER, isPrimary: true },
    { parentId: parent2.id, studentId: students[4].id, relationship: ParentChildRelationship.FATHER, isPrimary: true },
  ];

  for (const link of links) {
    await prisma.parentStudent.upsert({
      where: {
        parentId_studentId: {
          parentId: link.parentId,
          studentId: link.studentId,
        },
      },
      update: {
        relationship: link.relationship,
        isPrimary: link.isPrimary,
      },
      create: link,
    });
  }

  // ========================================
  // CLASSES
  // ========================================

  const classBlueprints = [
    { name: 'Class 8', code: 'CLS-8' },
    { name: 'Class 9', code: 'CLS-9' },
  ];

  const classes = [];
  for (const blueprint of classBlueprints) {
    const cls = await prisma.class.upsert({
      where: { schoolId_code: { schoolId: school.id, code: blueprint.code } },
      update: { name: blueprint.name, status: ClassStatus.ACTIVE },
      create: {
        schoolId: school.id,
        name: blueprint.name,
        code: blueprint.code,
        academicYearId: currentYear.id,
        status: ClassStatus.ACTIVE,
      },
    });
    classes.push(cls);
  }

  // ========================================
  // SECTIONS
  // ========================================

  const sections = [];
  for (const cls of classes) {
    for (const name of ['A', 'B']) {
      const section = await prisma.section.upsert({
        where: { classId_name: { classId: cls.id, name } },
        update: { status: SectionStatus.ACTIVE },
        create: {
          schoolId: school.id,
          classId: cls.id,
          name,
          capacity: 40,
          status: SectionStatus.ACTIVE,
        },
      });
      sections.push(section);
    }
  }

  // ========================================
  // SUBJECTS
  // ========================================

  const subjectBlueprints = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
  ];

  const subjects = [];
  for (const blueprint of subjectBlueprints) {
    const subject = await prisma.subject.upsert({
      where: { schoolId_code: { schoolId: school.id, code: blueprint.code } },
      update: { name: blueprint.name, status: SubjectStatus.ACTIVE },
      create: {
        schoolId: school.id,
        name: blueprint.name,
        code: blueprint.code,
        description: `${blueprint.name} for secondary level`,
        status: SubjectStatus.ACTIVE,
      },
    });
    subjects.push(subject);
  }

  // ========================================
  // COURSES (subject + teacher + class/section)
  // ========================================

  const courseBlueprints = [
    {
      name: 'Mathematics - Class 8A',
      code: 'CRS-MATH-8A',
      subjectId: subjects[0].id,
      teacherId: teacher1.id,
      classId: classes[0].id,
      sectionId: sections[0].id,
    },
    {
      name: 'Science - Class 8A',
      code: 'CRS-SCI-8A',
      subjectId: subjects[1].id,
      teacherId: teacher2.id,
      classId: classes[0].id,
      sectionId: sections[0].id,
    },
    {
      name: 'English - Class 9A',
      code: 'CRS-ENG-9A',
      subjectId: subjects[2].id,
      teacherId: teacher2.id,
      classId: classes[1].id,
      sectionId: sections[2].id,
    },
  ];

  for (const blueprint of courseBlueprints) {
    await prisma.course.upsert({
      where: { schoolId_code: { schoolId: school.id, code: blueprint.code } },
      update: {
        name: blueprint.name,
        subjectId: blueprint.subjectId,
        teacherId: blueprint.teacherId,
        classId: blueprint.classId,
        sectionId: blueprint.sectionId,
        status: CourseStatus.ACTIVE,
      },
      create: {
        schoolId: school.id,
        name: blueprint.name,
        code: blueprint.code,
        subjectId: blueprint.subjectId,
        teacherId: blueprint.teacherId,
        classId: blueprint.classId,
        sectionId: blueprint.sectionId,
        status: CourseStatus.ACTIVE,
      },
    });
  }

  // ========================================
  // ENROLLMENTS
  // ========================================

  const enrollmentBlueprints = [
    { studentIndex: 0, classIndex: 0, sectionIndex: 0 },
    { studentIndex: 1, classIndex: 0, sectionIndex: 0 },
    { studentIndex: 2, classIndex: 0, sectionIndex: 1 },
    { studentIndex: 3, classIndex: 1, sectionIndex: 2 },
    { studentIndex: 4, classIndex: 1, sectionIndex: 2 },
  ];

  for (const blueprint of enrollmentBlueprints) {
    const student = students[blueprint.studentIndex];
    const cls = classes[blueprint.classIndex];
    const section = sections[blueprint.sectionIndex];

    await prisma.enrollment.upsert({
      where: {
        studentId_classId_academicYearId: {
          studentId: student.id,
          classId: cls.id,
          academicYearId: currentYear.id,
        },
      },
      update: { sectionId: section.id, status: EnrollmentStatus.ACTIVE },
      create: {
        schoolId: school.id,
        studentId: student.id,
        classId: cls.id,
        sectionId: section.id,
        academicYearId: currentYear.id,
        status: EnrollmentStatus.ACTIVE,
      },
    });
  }

  // ========================================
  // TEACHER ↔ CLASS ASSIGNMENTS
  // ========================================

  const teacherClassBlueprints = [
    { teacherId: teacher1.id, classId: classes[0].id, sectionId: sections[0].id, subjectId: subjects[0].id },
    { teacherId: teacher2.id, classId: classes[0].id, sectionId: sections[0].id, subjectId: subjects[1].id },
    { teacherId: teacher2.id, classId: classes[1].id, sectionId: sections[2].id, subjectId: subjects[2].id },
  ];

  for (const blueprint of teacherClassBlueprints) {
    const existing = await prisma.teacherClass.findFirst({
      where: {
        teacherId: blueprint.teacherId,
        classId: blueprint.classId,
        sectionId: blueprint.sectionId,
        subjectId: blueprint.subjectId,
      },
      select: { id: true },
    });

    if (!existing) {
      await prisma.teacherClass.create({
        data: {
          schoolId: school.id,
          ...blueprint,
        },
      });
    }
  }

  console.log('Database seeded successfully.');
  console.log('');
  console.log('Demo credentials:');
  console.log(`  SUPER_ADMIN   superadmin@gyannportal.com  / ${SUPER_ADMIN_PASSWORD}`);
  console.log(`  SCHOOL_ADMIN  schooladmin@gyannportal.com / ${DEMO_PASSWORD}`);
  console.log(`  TEACHER       teacher1@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  TEACHER       teacher2@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  PARENT        parent1@gyannportal.com     / ${DEMO_PASSWORD}`);
  console.log(`  PARENT        parent2@gyannportal.com     / ${DEMO_PASSWORD}`);
  console.log(`  STUDENT       student1@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  STUDENT       student2@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  STUDENT       student3@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  STUDENT       student4@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log(`  STUDENT       student5@gyannportal.com    / ${DEMO_PASSWORD}`);
  console.log('');
  console.log(`  School: ${school.name} (${school.code})`);
  console.log(`  Branch: ${branch.name}`);
  console.log(`  Current academic year: ${currentYear.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });