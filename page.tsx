'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../lib/types';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dashkirana_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('dashkirana_cart', JSON.stringify(updatedCart));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter((item) => item.product.id !== productId));
    } else {
      saveCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalMRP = cart.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );
  const discount = totalMRP - subtotal;
  const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 20;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-extrabold text-base text-gray-900">Your Cart</h1>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Your cart is empty</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Free Delivery Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
              {subtotal > 199 ? (
                <span className="font-bold">🎉 You unlocked FREE Delivery!</span>
              ) : (
                <span>
                  Add <b>₹{200 - subtotal}</b> more for FREE Delivery
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3 flex items-center gap-3 justify-between"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {product.image}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <span className="text-[10px] text-gray-500 block">
                      {product.unit} • ₹{product.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg p-0.5">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(product.id, quantity - 1)
                      }
                      className="w-6 h-6 rounded-md bg-white text-emerald-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-emerald-900 px-1">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(product.id, quantity + 1)
                      }
                      className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-xs">
              <h3 className="font-bold text-gray-900 mb-2">Bill Details</h3>
              <div className="flex justify-between text-gray-600">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-sm text-gray-900">
                <span>To Pay</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout CTA */}
      {cart.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
          <Link
            href="/checkout"
            className="w-full bg-emerald-600 text-white font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-between shadow-md hover:bg-emerald-700 transition"
          >
            <span>Proceed to Checkout</span>
            <span>₹{total} →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
