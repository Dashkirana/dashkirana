'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { CartItem, PaymentMethod, Address } from '../../lib/types';
import { createOrder } from '../../lib/services/store';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');

  const [address, setAddress] = useState<Address>({
    name: 'Customer',
    phone: '9999999999',
    addressLine: 'Door No. 45/12-A, Park Road',
    area: 'NR Peta',
    city: 'Kurnool',
    pincode: '518004',
    landmark: 'Near Govt Hospital',
    deliveryInstructions: 'Leave at front gate if busy',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('dashkirana_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedUser = localStorage.getItem('dashkirana_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setAddress((prev) => ({
            ...prev,
            name: u.name || prev.name,
            phone: u.phone || prev.phone,
          }));
        } catch {}
      }
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 20;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || submitting) return;

    setSubmitting(true);

    try {
      // Update local user profile if provided in checkout
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('dashkirana_user');
        const existing = savedUser ? JSON.parse(savedUser) : {};
        localStorage.setItem(
          'dashkirana_user',
          JSON.stringify({
            ...existing,
            name: address.name,
            phone: address.phone,
          })
        );
      }

      const orderItems = cart.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        price: product.price,
        quantity,
        image: product.image,
      }));

      const newOrder = await createOrder({
        customerName: address.name,
        customerPhone: address.phone,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        address,
        paymentMethod,
      });

      // Clear cart upon successful placement
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dashkirana_cart');
      }
      router.push(`/orders/${newOrder.id}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(err?.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 max-w-md mx-auto shadow-xl">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-base text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="p-4 space-y-4">
        {/* Address Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Delivery Address (Kurnool)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                Full Name
              </label>
              <input
                required
                type="text"
                value={address.name}
                onChange={(e) =>
                  setAddress({ ...address, name: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                Phone Number
              </label>
              <input
                required
                type="tel"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
              Address Line / Door No
            </label>
            <input
              required
              type="text"
              value={address.addressLine}
              onChange={(e) =>
                setAddress({ ...address, addressLine: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-semibold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                Area
              </label>
              <input
                required
                type="text"
                value={address.area}
                onChange={(e) =>
                  setAddress({ ...address, area: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                City
              </label>
              <input
                required
                type="text"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-0.5">
                Pincode
              </label>
              <input
                required
                type="text"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-xs">
          <h3 className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">
            Payment Option
          </h3>

          <div className="space-y-2">
            <label
              onClick={() => setPaymentMethod('Cash on Delivery')}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-xs text-gray-900 block">
                    Cash on Delivery
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Pay at your doorstep upon receipt
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Cash on Delivery'}
                onChange={() => setPaymentMethod('Cash on Delivery')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label
              onClick={() => setPaymentMethod('UPI / Online Payment')}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                paymentMethod === 'UPI / Online Payment'
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-xs text-gray-900 block">
                    UPI / Online Payment
                  </span>
                  <span className="text-[10px] text-gray-500">
                    GPay, PhonePe, Paytm, BHIM
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'UPI / Online Payment'}
                onChange={() => setPaymentMethod('UPI / Online Payment')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Order Summary mini */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1.5 text-xs shadow-xs">
          <div className="flex justify-between text-gray-600">
            <span>Items Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-2 border-t border-gray-100">
            <span>To Pay</span>
            <span className="text-emerald-700">₹{total}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || cart.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-50"
        >
          {submitting ? 'Placing Order...' : `Place Order • ₹${total}`}
        </button>
      </form>
    </div>
  );
}
