import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Session } from '../auth/entities/session.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../product-images/entities/product-image.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { WishlistItem } from '../wishlist/entities/wishlist-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Session,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Cart,
    CartItem,
    Wishlist,
    WishlistItem,
    Order,
    OrderItem,
    Payment,
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});
