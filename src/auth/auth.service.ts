import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
    sub: string;
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const { email, password, name } = registerDto;
        // console.log('registering:', email);

        const existingUser = await this.usersRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            name,
        });
        await this.usersRepository.save(user);

        const payload: JwtPayload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async validateUser(payload: JwtPayload): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: payload.sub } });
    }
}
