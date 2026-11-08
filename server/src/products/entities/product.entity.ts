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

import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from '../../product-images/entities/product-image.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
  })
  category: Category;

  @Column({
    type: 'varchar',
  })
  name: string;

  @OneToMany(() => ProductImage, (productImage) => productImage.product)
  images: ProductImage[];

  @Column({
    type: 'varchar',
    unique: true,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: string;

  @Column({
    name: 'discount_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  discountPrice: string | null;

  @Column({
    type: 'varchar',
    unique: true,
  })
  sku: string;

  @Column({
    name: 'stock_quantity',
    type: 'integer',
    default: 0,
  })
  stockQuantity: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
