
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../../lib/types';
import { getOrderById } from '../../../lib/services/store';
import { supabase } from '../../../lib/supabase/client';

const STATUS_STEPS: OrderStatus[] = [
  'Placed',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async (manual = false) => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    if (manual) setRefreshing(true);

    try {
      const data = await getOrderById(orderId);

      if (data) {
        setOrder(data);
        setError('');
      } else {
        setError('Order not found or you do not have permission to view it.');
      }
    } catch (err) {
      console.error('Unable to fetch order:', err);
      setError('Unable to load this order. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();

    // Keep polling as a fallback in case Realtime is unavailable.
    const interval = window.setInterval(() => {
      void fetchOrder();
    }, 3000);

    // Subscribe to changes for this order only.
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          // Fetch the full order again so the UI uses the same
          // data mapping as the rest of the application.
          void fetchOrder();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Order tracking realtime connected');
        }
      });

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [orderId, fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-md mx-auto">
        <div className="animate-spin text-emerald-600 text-2xl">⚡</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <h1 className="font-bold text-gray-900 mb-2">
            Unable to show order
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            {error || 'This order could not be found.'}
          </p>
          <button
            onClick={() => void fetchOrder(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/orders')}
            className="block w-full mt-3 text-sm text-gray-600"
          >
            Back to my orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 max-w-md mx-auto shadow-xl">
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Back to my orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm text-gray-900">
              Order #{order.id}
            </h1>
            <span className="text-[10px] text-gray-500 block">
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <button
          onClick={() => void fetchOrder(true)}
          disabled={refreshing}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
          title="Refresh status"
          aria-label="Refresh order status"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                Delivery estimate
              </span>
              <h2 className="text-lg font-extrabold text-gray-900">
                10–15 Mins
              </h2>
            </div>
            <div className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{order.status}</span>
            </div>
          </div>

          <div className="space-y-3 pl-2 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = currentStepIndex >= 0 && idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-emerald-700'
                        : isDone
                          ? 'text-gray-900'
                          : 'text-gray-400'
                    }`}
                  >
                    {step}
                    {isCurrent ? ' · Current status' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-400">
            Order status updates automatically when the shop updates your order.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
            Items ordered
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <div key={`${item.productId}-${i}`} className="py-2 flex justify-between items-center gap-3">
                <div>
                  <span className="font-bold text-gray-800">
                    {item.productName}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {item.quantity} × {item.unit}
                  </span>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-2 flex justify-between font-extrabold text-sm text-gray-900">
            <span>Total ({order.paymentMethod})</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-900">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Delivery address</span>
          </div>
          <p className="text-gray-600">
            {order.address.name} ({order.address.phone})<br />
            {order.address.addressLine}, {order.address.area}<br />
            {order.address.city} - {order.address.pincode}
          </p>
        </div>
      </div>
    </div>
  );
}
