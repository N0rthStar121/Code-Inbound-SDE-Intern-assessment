import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let authService: AuthService;

    const mockUser: Partial<User> = {
        id: 'user-uuid-123',
        email: 'test@example.com',
        name: 'Test User',
    };

    const mockAuthService = {
        validateUser: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return user for valid JWT payload', async () => {
            const payload = { sub: 'user-uuid-123', email: 'test@example.com' };
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual(mockUser);
            expect(authService.validateUser).toHaveBeenCalledWith(payload);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const payload = { sub: 'nonexistent-id', email: 'test@example.com' };
            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
