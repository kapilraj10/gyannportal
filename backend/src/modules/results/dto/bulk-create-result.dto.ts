import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ResultRecordDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkCreateResultDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsArray()
  @IsObject({ each: true })
  records: ResultRecordDto[];

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;
}