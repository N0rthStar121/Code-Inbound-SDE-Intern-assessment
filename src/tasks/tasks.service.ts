import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { User } from '../users/entities/user.entity';

export interface PaginatedTasks {
    data: Task[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        // console.log('creating task for:', user.id);
        const task = this.tasksRepository.create({
            ...createTaskDto,
            userId: user.id,
        });
        return this.tasksRepository.save(task);
    }

    async findAll(user: User, paginationDto: PaginationDto): Promise<PaginatedTasks> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await this.tasksRepository.findAndCount({
            where: { userId: user.id },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, user: User): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id } });

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }

        if (task.userId !== user.id) {
            throw new ForbiddenException('You do not have access to this task');
        }

        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
        const task = await this.findOne(id, user);
        Object.assign(task, updateTaskDto);
        return this.tasksRepository.save(task);
    }

    async remove(id: string, user: User): Promise<void> {
        const task = await this.findOne(id, user);
        await this.tasksRepository.remove(task);
    }
}
