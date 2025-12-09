import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING,
    })
    status: TaskStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;
}
