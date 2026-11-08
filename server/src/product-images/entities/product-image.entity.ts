import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Product,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'product_id',
  })
  product: Product;

  @Column({
    name: 'image_url',
    type: 'varchar',
  })
  imageUrl: string;

  @Column({
    name: 'alt_text',
    type: 'varchar',
    nullable: true,
  })
  altText: string | null;

  @Column({
    name: 'is_primary',
    type: 'boolean',
    default: false,
  })
  isPrimary: boolean;

  @Column({
    type: 'integer',
    default: 0,
  })
  sortOrder: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}