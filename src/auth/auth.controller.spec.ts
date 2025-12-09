import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthResponse: AuthResponse = {
        accessToken: 'mock-jwt-token',
        user: {
            id: 'user-uuid-123',
            email: 'test@example.com',
            name: 'Test User',
        },
    };

    const mockAuthService = {
        register: jest.fn().mockResolvedValue(mockAuthResponse),
        login: jest.fn().mockResolvedValue(mockAuthResponse),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('POST /auth/register', () => {
        it('should register user and return token', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            };

            const result = await controller.register(registerDto);

            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(mockAuthResponse);
            expect(result.accessToken).toBeDefined();
        });
    });

    describe('POST /auth/login', () => {
        it('should login and return token', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(mockAuthResponse);
            expect(result.accessToken).toBeDefined();
        });
    });
});
