import { PartialType } from '@nestjs/swagger';
import { CreateEnrollmentDto } from './create-enrollment.dto.js';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}