import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService, PaginatedTasks } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import { User } from '../users/entities/user.entity';

describe('TasksService', () => {
    let service: TasksService;
    let tasksRepository: Repository<Task>;

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

    const mockTasksRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useValue: mockTasksRepository,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a task for authenticated user', async () => {
            const createTaskDto = {
                title: 'New Task',
                description: 'Task description',
            };

            mockTasksRepository.create.mockReturnValue({
                ...createTaskDto,
                userId: mockUser.id,
            });
            mockTasksRepository.save.mockResolvedValue({
                id: 'new-task-id',
                ...createTaskDto,
                userId: mockUser.id,
                status: TaskStatus.PENDING,
            });

            const result = await service.create(createTaskDto, mockUser as User);

            expect(mockTasksRepository.create).toHaveBeenCalledWith({
                ...createTaskDto,
                userId: mockUser.id,
            });
            expect(mockTasksRepository.save).toHaveBeenCalled();
            expect(result.title).toBe(createTaskDto.title);
        });
    });

    describe('findAll', () => {
        it('should return paginated tasks for user', async () => {
            const tasks = [mockTask, { ...mockTask, id: 'task-2' }];
            mockTasksRepository.findAndCount.mockResolvedValue([tasks, 2]);

            const result = await service.findAll(mockUser as User, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.totalPages).toBe(1);
            expect(mockTasksRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10,
            });
        });

        it('should calculate pagination correctly', async () => {
            mockTasksRepository.findAndCount.mockResolvedValue([[], 25]);

            const result = await service.findAll(mockUser as User, { page: 2, limit: 10 });

            expect(result.meta.totalPages).toBe(3);
            expect(mockTasksRepository.findAndCount).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                order: { createdAt: 'DESC' },
                skip: 10,
                take: 10,
            });
        });
    });

    describe('findOne', () => {
        it('should return task owned by user', async () => {
            mockTasksRepository.findOne.mockResolvedValue(mockTask);

            const result = await service.findOne('task-uuid-123', mockUser as User);

            expect(result).toEqual(mockTask);
            expect(mockTasksRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'task-uuid-123' },
            });
        });

        it('should throw NotFoundException for non-existent task', async () => {
            mockTasksRepository.findOne.mockResolvedValue(null);

            await expect(
                service.findOne('nonexistent-id', mockUser as User),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException for task owned by another user', async () => {
            const anotherUsersTask = { ...mockTask, userId: 'another-user-id' };
            mockTasksRepository.findOne.mockResolvedValue(anotherUsersTask);

            await expect(
                service.findOne('task-uuid-123', mockUser as User),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('update', () => {
        it('should update task owned by user', async () => {
            const updateTaskDto = { title: 'Updated Title' };
            mockTasksRepository.findOne.mockResolvedValue({ ...mockTask });
            mockTasksRepository.save.mockResolvedValue({
                ...mockTask,
                ...updateTaskDto,
            });

            const result = await service.update(
                'task-uuid-123',
                updateTaskDto,
                mockUser as User,
            );

            expect(result.title).toBe('Updated Title');
            expect(mockTasksRepository.save).toHaveBeenCalled();
        });

        it('should throw ForbiddenException when updating another users task', async () => {
            const anotherUsersTask = { ...mockTask, userId: 'another-user-id' };
            mockTasksRepository.findOne.mockResolvedValue(anotherUsersTask);

            await expect(
                service.update('task-uuid-123', { title: 'Updated' }, mockUser as User),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('remove', () => {
        it('should delete task owned by user', async () => {
            mockTasksRepository.findOne.mockResolvedValue(mockTask);
            mockTasksRepository.remove.mockResolvedValue(mockTask);

            await service.remove('task-uuid-123', mockUser as User);

            expect(mockTasksRepository.remove).toHaveBeenCalledWith(mockTask);
        });

        it('should throw ForbiddenException when deleting another users task', async () => {
            const anotherUsersTask = { ...mockTask, userId: 'another-user-id' };
            mockTasksRepository.findOne.mockResolvedValue(anotherUsersTask);

            await expect(
                service.remove('task-uuid-123', mockUser as User),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException for non-existent task', async () => {
            mockTasksRepository.findOne.mockResolvedValue(null);

            await expect(
                service.remove('nonexistent-id', mockUser as User),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
