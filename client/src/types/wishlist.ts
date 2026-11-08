export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  discountPrice: string | null;
  isActive: boolean;
}

export interface WishlistItem {
  id: string;
  product: WishlistProduct;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  totalItems: number;
}

export interface AddWishlistItemPayload {
  productId: string;
}

export interface AddWishlistItemResponse {
  id: string;
  product: WishlistProduct;
}