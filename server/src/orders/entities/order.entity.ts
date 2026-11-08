import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CancellationRequestStatus } from '../enums/cancellation-request-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'order_number',
    type: 'varchar',
    unique: true,
  })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: string;

  @Column({
    name: 'shipping_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingFee: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discount: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: string;

  @Column({
    name: 'shipping_address',
    type: 'jsonb',
  })
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'cancellation_reason',
    type: 'text',
    nullable: true,
  })
  cancellationReason: string | null;

  @Column({
    name: 'cancellation_request_status',
    type: 'enum',
    enum: CancellationRequestStatus,
    nullable: true,
  })
  cancellationRequestStatus: CancellationRequestStatus | null;

  @Column({
    name: 'cancellation_requested_at',
    type: 'timestamptz',
    nullable: true,
  })
  cancellationRequestedAt: Date | null;

  @Column({
    name: 'cancellation_reviewed_at',
    type: 'timestamptz',
    nullable: true,
  })
  cancellationReviewedAt: Date | null;

  @Column({
    name: 'cancellation_review_note',
    type: 'text',
    nullable: true,
  })
  cancellationReviewNote: string | null;

  @Column({
    name: 'inventory_deducted',
    type: 'boolean',
    default: false,
  })
  inventoryDeducted: boolean;

  @Column({
    name: 'inventory_restored',
    type: 'boolean',
    default: false,
  })
  inventoryRestored: boolean;
}
