import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];
}
