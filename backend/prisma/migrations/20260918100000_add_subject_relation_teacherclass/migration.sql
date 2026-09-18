-- Add missing subject relation on teacher_classes (subjectId was declared but never linked)
ALTER TABLE "teacher_classes" ADD CONSTRAINT "teacher_classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- Reconcile drift: these indexes exist in the DB but were never recorded in migrations
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_role_id_status_idx" ON "users"("role_id", "status");