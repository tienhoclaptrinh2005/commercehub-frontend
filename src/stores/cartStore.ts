import { create } from "zustand";

import { getApiErrorMessage } from "@/services/api";
import { cartService } from "@/services/cart.service";
import type { Cart, CartCheckoutRequest } from "@/types";

const EMPTY_CART: Cart = {
  cartId: null,
  items: [],
  totalItems: 0,
  totalQuantity: 0,
  totalAmount: 0,
};

interface CartState {
  cart: Cart;
  loadedForUserId: number | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  loadCart: (userId: number, force?: boolean) => Promise<Cart | null>;
  reset: () => void;
  clearError: () => void;
  addItem: (userId: number, productVariantId: number, quantity: number) => Promise<Cart>;
  updateQuantity: (itemId: number, quantity: number) => Promise<Cart>;
  removeItem: (itemId: number) => Promise<Cart>;
  clearCart: () => Promise<void>;
  checkout: (request: CartCheckoutRequest) => Promise<number[]>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: EMPTY_CART,
  loadedForUserId: null,
  isLoading: false,
  isMutating: false,
  error: null,

  loadCart: async (userId, force = false) => {
    const current = get();
    if (current.isLoading) return null;
    if (!force && current.loadedForUserId === userId) return current.cart;

    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getMyCart();
      set({ cart, loadedForUserId: userId });
      return cart;
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Không thể tải giỏ hàng") });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      cart: EMPTY_CART,
      loadedForUserId: null,
      isLoading: false,
      isMutating: false,
      error: null,
    }),

  clearError: () => set({ error: null }),

  addItem: async (userId, productVariantId, quantity) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartService.addItem({ productVariantId, quantity });
      set({ cart, loadedForUserId: userId });
      return cart;
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể thêm sản phẩm vào giỏ");
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartService.updateQuantity(itemId, { quantity });
      set({ cart });
      return cart;
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Không thể cập nhật số lượng") });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isMutating: true, error: null });
    try {
      const cart = await cartService.removeItem(itemId);
      set({ cart });
      return cart;
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Không thể xóa sản phẩm") });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  clearCart: async () => {
    set({ isMutating: true, error: null });
    try {
      await cartService.clear();
      set((state) => ({ cart: { ...EMPTY_CART, cartId: state.cart.cartId } }));
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Không thể xóa giỏ hàng") });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  checkout: async (request) => {
    set({ isMutating: true, error: null });
    try {
      const orderIds = await cartService.checkout(request);
      set((state) => ({ cart: { ...EMPTY_CART, cartId: state.cart.cartId } }));
      return orderIds;
    } catch (error) {
      set({ error: getApiErrorMessage(error, "Không thể thanh toán giỏ hàng") });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },
}));
