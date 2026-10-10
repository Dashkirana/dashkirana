
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
} from 'lucide-react';
import type {
  CartItem,
  PaymentMethod,
  Address,
} from '../../lib/types';
import { createOrder } from '../../lib/services/store';

type SelectedLocation = {
  lat: number;
  lng: number;
};

const LocationPicker = dynamic(
  () => import('../../components/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-500">
        Loading map...
      </div>
    ),
  }
);

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [address, setAddress] = useState<Address>({
    name: 'Customer',
    phone: '',
    addressLine: '',
    area: '',
    city: 'Visakhapatnam',
    pincode: '',
    landmark: '',
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('dashkirana_cart');

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedUser = localStorage.getItem('dashkirana_user');

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setAddress((previous) => ({
          ...previous,
          name: user.name || previous.name,
          phone: user.phone || previous.phone,
        }));
      }
    } catch (error) {
      console.error('Could not load saved checkout data:', error);
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 20;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (cart.length === 0 || submitting) return;

    if (!selectedLocation) {
      alert('Please select your delivery location on the map.');
      return;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const savedUser = localStorage.getItem('dashkirana_user');
      const existingUser = savedUser
        ? JSON.parse(savedUser)
        : {};

      localStorage.setItem(
        'dashkirana_user',
        JSON.stringify({
          ...existingUser,
          name: address.name,
          phone: address.phone,
        })
      );

      const orderItems = cart.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        price: product.price,
        quantity,
        image: product.image,
      }));

      // Keep coordinates with the address stored on the order.
      const deliveryAddress = {
        ...address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      };

      const newOrder = await createOrder({
        customerName: address.name,
        customerPhone: address.phone,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        address: deliveryAddress,
        paymentMethod,
      });

      localStorage.removeItem('dashkirana_cart');

      router.push(`/orders/${newOrder.id}`);
    } catch (error: unknown) {
      console.error('Order creation error:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to place order. Please try again.';

      alert(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-12 shadow-xl">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="rounded-full p-1 text-gray-600 transition hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-base font-extrabold text-gray-900">
          Checkout
        </h1>
      </header>

      <form onSubmit={handlePlaceOrder} className="space-y-4 p-4">
        {/* Delivery address */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2 text-xs font-bold text-gray-900">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Delivery Address — Visakhapatnam</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Select your delivery location *
            </label>

            <LocationPicker
              onLocationChange={setSelectedLocation}
            />

            <p className="mt-2 text-xs text-gray-600">
              {selectedLocation
                ? `Selected: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                : 'Tap the map or drag the marker to choose your exact location.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                Full Name
              </label>
              <input
                required
                type="text"
                value={address.name}
                onChange={(event) =>
                  setAddress({
                    ...address,
                    name: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                Phone Number
              </label>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={address.phone}
                onChange={(event) =>
                  setAddress({
                    ...address,
                    phone: event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-500">
              Address Line / Door Number
            </label>
            <input
              required
              type="text"
              value={address.addressLine}
              onChange={(event) =>
                setAddress({
                  ...address,
                  addressLine: event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                Area
              </label>
              <input
                required
                type="text"
                value={address.area}
                onChange={(event) =>
                  setAddress({
                    ...address,
                    area: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold text-gray-500">
                Pincode
              </label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                value={address.pincode}
                onChange={(event) =>
                  setAddress({
                    ...address,
                    pincode: event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6),
                  })
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 font-semibold focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold text-gray-500">
              Landmark (optional)
            </label>
            <input
              type="text"
              value={address.landmark || ''}
              onChange={(event) =>
                setAddress({
                  ...address,
                  landmark: event.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </section>

        {/* Payment options */}
        <section className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="border-b border-gray-100 pb-2 text-xs font-bold text-gray-900">
            Payment Option
          </h2>

          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
              paymentMethod === 'Cash on Delivery'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Banknote className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="block text-xs font-bold text-gray-900">
                  Cash on Delivery
                </span>
                <span className="text-[10px] text-gray-500">
                  Pay at your doorstep
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
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
              paymentMethod === 'UPI / Online Payment'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <div>
                <span className="block text-xs font-bold text-gray-900">
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
              onChange={() =>
                setPaymentMethod('UPI / Online Payment')
              }
              className="text-emerald-600 focus:ring-emerald-500"
            />
          </label>
        </section>

        {/* Order summary */}
        <section className="space-y-1.5 rounded-2xl border border-gray-100 bg-white p-4 text-xs shadow-sm">
          <div className="flex justify-between text-gray-600">
            <span>Items Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-extrabold text-gray-900">
            <span>To Pay</span>
            <span className="text-emerald-700">₹{total}</span>
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting || cart.length === 0}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting
            ? 'Placing Order...'
            : `Place Order • ₹${total}`}
        </button>
      </form>
    </div>
  );
}
