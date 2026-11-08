export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  discountPrice: string | null;
}

export interface CartVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: string;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  variant: CartVariant | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: string;
}

/* =========================
   ADD CART ITEM
========================= */

export interface AddCartItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface AddCartItemResponse {
  id: string;

  product: {
    id: string;
    name: string;
    slug: string;
  };

  variant: CartVariant | null;
  quantity: number;
  unitPrice: string;
}

/* =========================
   UPDATE CART ITEM
========================= */

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface UpdateCartItemResponse {
  id: string;

  product: {
    id: string;
    name: string;
    slug: string;
  };

  variant: CartVariant | null;
  quantity: number;
  unitPrice: string;
}