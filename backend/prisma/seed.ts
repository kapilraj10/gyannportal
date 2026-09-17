import {
  PrismaClient,
  SchoolType,
  SchoolLevel,
  SchoolStatus,
  AcademicYearStatus,
  BranchStatus,
  UserStatus,
} from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ========================================
  // PERMISSIONS
  // ========================================

  const permissions = [
    'dashboard.view',

    'school.view',
    'school.create',
    'school.update',
    'school.delete',

    'branch.view',
    'branch.create',
    'branch.update',
    'branch.delete',

    'academic_year.view',
    'academic_year.create',
    'academic_year.update',
    'academic_year.delete',

    'user.view',
    'user.create',
    'user.update',
    'user.delete',

    'role.view',
    'role.create',
    'role.update',
    'role.delete',

    'permission.view',
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ========================================
  // ROLES
  // ========================================

  const adminRole = await prisma.role.upsert({
    where: {
      name: 'SUPER_ADMIN',
    },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
    },
  });

  const schoolAdminRole = await prisma.role.upsert({
    where: {
      name: 'SCHOOL_ADMIN',
    },
    update: {},
    create: {
      name: 'SCHOOL_ADMIN',
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: {
      name: 'TEACHER',
    },
    update: {},
    create: {
      name: 'TEACHER',
    },
  });

  const studentRole = await prisma.role.upsert({
    where: {
      name: 'STUDENT',
    },
    update: {},
    create: {
      name: 'STUDENT',
    },
  });

  // ========================================
  // SUPER ADMIN PERMISSIONS
  // ========================================

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // ========================================
  // SCHOOL
  // ========================================

  const school = await prisma.school.upsert({
    where: {
      code: 'GYAN001',
    },
    update: {},
    create: {
      name: 'GyannPortal School',
      code: 'GYAN001',
      registrationNumber: 'REG-001',
      schoolType: SchoolType.PRIVATE,
      level: SchoolLevel.SECONDARY,
      establishedYear: 2026,
      email: 'admin@gyannportal.com',
      phone: '9800000000',
      website: 'https://gyannportal.com',
      address: 'Kathmandu, Nepal',
      status: SchoolStatus.ACTIVE,
    },
  });

  // ========================================
  // ACADEMIC YEAR
  // ========================================

  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: '2083/84',
      startDate: new Date('2026-04-14'),
      endDate: new Date('2027-04-13'),
      status: AcademicYearStatus.ACTIVE,
    },
  });

  // ========================================
  // BRANCH
  // ========================================

  const branch = await prisma.branch.create({
    data: {
      schoolId: school.id,
      name: 'Main Branch',
      address: 'Kathmandu, Nepal',
      status: BranchStatus.ACTIVE,
    },
  });

  // ========================================
  // SUPER ADMIN USER
  // ========================================

  const passwordHash = await bcrypt.hash(
    'Admin@123',
    12,
  );

  await prisma.user.upsert({
    where: {
      email: 'admin@gyannportal.com',
    },
    update: {},
    create: {
      schoolId: school.id,
      branchId: branch.id,
      name: 'System Administrator',
      email: 'admin@gyannportal.com',
      phone: '9800000000',
      passwordHash,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });