import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService, PaginatedTasks } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';

describe('TasksController', () => {
    let controller: TasksController;
    let tasksService: TasksService;

    const mockUser: Partial<User> = {
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
    };

    const mockTask: Partial<Task> = {
        id: 'task-uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        userId: 'user-uuid-123',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPaginatedTasks: PaginatedTasks = {
        data: [mockTask as Task],
        meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
        },
    };

    const mockTasksService = {
        create: jest.fn().mockResolvedValue(mockTask),
        findAll: jest.fn().mockResolvedValue(mockPaginatedTasks),
        findOne: jest.fn().mockResolvedValue(mockTask),
        update: jest.fn().mockResolvedValue(mockTask),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: mockTasksService,
                },
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('POST /tasks', () => {
        it('should create a task', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'New Task',
                description: 'Task description',
            };

            const result = await controller.create(createTaskDto, mockUser as User);

            expect(tasksService.create).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual(mockTask);
        });
    });

    describe('GET /tasks', () => {
        it('should return paginated tasks', async () => {
            const paginationDto = { page: 1, limit: 10 };

            const result = await controller.findAll(paginationDto, mockUser as User);

            expect(tasksService.findAll).toHaveBeenCalledWith(mockUser, paginationDto);
            expect(result).toEqual(mockPaginatedTasks);
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('GET /tasks/:id', () => {
        it('should return a single task', async () => {
            const result = await controller.findOne('task-uuid-123', mockUser as User);

            expect(tasksService.findOne).toHaveBeenCalledWith('task-uuid-123', mockUser);
            expect(result).toEqual(mockTask);
        });
    });

    describe('PATCH /tasks/:id', () => {
        it('should update a task', async () => {
            const updateTaskDto: UpdateTaskDto = {
                title: 'Updated Title',
                status: TaskStatus.IN_PROGRESS,
            };

            mockTasksService.update.mockResolvedValue({
                ...mockTask,
                ...updateTaskDto,
            });

            const result = await controller.update(
                'task-uuid-123',
                updateTaskDto,
                mockUser as User,
            );

            expect(tasksService.update).toHaveBeenCalledWith(
                'task-uuid-123',
                updateTaskDto,
                mockUser,
            );
            expect(result.title).toBe('Updated Title');
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('should delete a task', async () => {
            await controller.remove('task-uuid-123', mockUser as User);

            expect(tasksService.remove).toHaveBeenCalledWith('task-uuid-123', mockUser);
        });
    });
});
