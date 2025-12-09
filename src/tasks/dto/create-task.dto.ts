import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus, { message: 'Status must be PENDING, IN_PROGRESS, or COMPLETED' })
    @IsOptional()
    status?: TaskStatus;
}
