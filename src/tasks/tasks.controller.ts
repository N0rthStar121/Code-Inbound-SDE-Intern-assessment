import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TasksService, PaginatedTasks } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Task } from './entities/task.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User,
    ): Promise<Task> {
        return this.tasksService.create(createTaskDto, user);
    }

    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @GetUser() user: User,
    ): Promise<PaginatedTasks> {
        return this.tasksService.findAll(user, paginationDto);
    }

    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User,
    ): Promise<Task> {
        return this.tasksService.findOne(id, user);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @GetUser() user: User,
    ): Promise<Task> {
        return this.tasksService.update(id, updateTaskDto, user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: User,
    ): Promise<void> {
        return this.tasksService.remove(id, user);
    }
}
