import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';

// Social/community modules
import { UsersModule } from './users/users.module.js';
import { CommunitiesModule } from './communities/communities.module.js';
import { PostsModule } from './posts/posts.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { VotesModule } from './votes/votes.module.js';
import { SearchModule } from './search/search.module.js';
import { HomeModule } from './home/home.module.js';

// Platform modules (multi-tenant school architecture)
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { SuperAdminModule } from './modules/super-admin/super-admin.module.js';
import { SchoolAdminModule } from './modules/school-admin/school-admin.module.js';
import { SchoolsModule } from './modules/schools/schools.module.js';
import { BranchesModule } from './modules/branches/branches.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { TeachersModule } from './modules/teachers/teachers.module.js';
import { ParentsModule } from './modules/parents/parents.module.js';
import { ClassesModule } from './modules/classes/classes.module.js';
import { SectionsModule } from './modules/sections/sections.module.js';
import { SubjectsModule } from './modules/subjects/subjects.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { AssignmentsModule } from './modules/assignments/assignments.module.js';
import { ExamsModule } from './modules/exams/exams.module.js';
import { ResultsModule } from './modules/results/results.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { FilesModule } from './modules/files/files.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,

    // Platform core
    AuthModule,
    AuditLogsModule,
    UsersModule,

    // Platform management
    SuperAdminModule,
    SchoolAdminModule,
    SchoolsModule,
    BranchesModule,
    RolesModule,
    PermissionsModule,

    // Academic domain
    AcademicYearsModule,
    StudentsModule,
    TeachersModule,
    ParentsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,
    CoursesModule,
    EnrollmentsModule,
    AttendanceModule,
    AssignmentsModule,
    ExamsModule,
    ResultsModule,

    // Communication & media
    NotificationsModule,
    FilesModule,

    // Social/community
    CommunitiesModule,
    PostsModule,
    CommentsModule,
    VotesModule,
    SearchModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}