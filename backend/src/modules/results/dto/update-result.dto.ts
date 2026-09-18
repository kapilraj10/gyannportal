import { PartialType } from '@nestjs/swagger';
import { CreateResultDto } from './create-result.dto.js';

export class UpdateResultDto extends PartialType(CreateResultDto) {}