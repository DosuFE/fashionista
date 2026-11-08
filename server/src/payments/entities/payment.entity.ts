import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

import { PaymentAttemptStatus, PaymentProvider } from '../enums/payment.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.PAYSTACK,
  })
  provider: PaymentProvider;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  // Amount is stored in the smallest currency unit: kobo for NGN.
  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentAttemptStatus,
    default: PaymentAttemptStatus.PENDING,
  })
  status: PaymentAttemptStatus;

  @Column({
    name: 'authorization_url',
    type: 'text',
    nullable: true,
  })
  authorizationUrl: string | null;

  @Column({
    name: 'gateway_transaction_id',
    type: 'varchar',
    nullable: true,
  })
  gatewayTransactionId: string | null;

  @Column({
    name: 'failure_reason',
    type: 'text',
    nullable: true,
  })
  failureReason: string | null;

  @Column({
    name: 'paid_at',
    type: 'timestamptz',
    nullable: true,
  })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
