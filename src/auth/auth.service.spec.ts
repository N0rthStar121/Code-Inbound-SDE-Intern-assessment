import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersRepository: Repository<User>;
    let jwtService: JwtService;

    const mockUser: Partial<User> = {
        id: 'user-uuid-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        createdAt: new Date(),
    };

    const mockUsersRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        it('should hash password and create a new user', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);
            mockUsersRepository.create.mockReturnValue(mockUser);
            mockUsersRepository.save.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

            const result = await service.register(registerDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUsersRepository.create).toHaveBeenCalledWith({
                email: registerDto.email,
                password: 'hashedPassword123',
                name: registerDto.name,
            });
            expect(mockUsersRepository.save).toHaveBeenCalled();
            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe(mockUser.email);
        });

        it('should throw ConflictException if email already exists', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
        });
    });

    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should return JWT token for valid credentials', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login(loginDto);

            expect(result.accessToken).toBe('mock-jwt-token');
            expect(result.user.email).toBe(mockUser.email);
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('validateUser', () => {
        it('should return user for valid JWT payload', async () => {
            const payload = { sub: 'user-uuid-123', email: 'test@example.com' };
            mockUsersRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.validateUser(payload);

            expect(result).toEqual(mockUser);
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
                where: { id: payload.sub },
            });
        });

        it('should return null if user not found', async () => {
            const payload = { sub: 'nonexistent-id', email: 'test@example.com' };
            mockUsersRepository.findOne.mockResolvedValue(null);

            const result = await service.validateUser(payload);

            expect(result).toBeNull();
        });
    });
});
