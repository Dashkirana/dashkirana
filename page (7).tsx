'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '../../../lib/types';
import { getOrders, updateOrderStatus } from '../../../lib/services/store';

const ALL_STATUSES: OrderStatus[] = [
  'Placed',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <h1 className="text-lg font-black text-gray-900">Order Fulfillment</h1>
          <Link href="/admin" className="text-xs font-bold text-emerald-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </header>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <span className="font-extrabold text-sm text-gray-900">
                    Order #{order.id}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {order.customerName} ({order.customerPhone})
                  </span>
                </div>

                {/* Status Dropdown */}
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="bg-emerald-50 border border-emerald-300 font-bold text-xs text-emerald-900 rounded-lg p-2 focus:outline-none"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-semibold text-gray-700">
                  Items: {order.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                </p>
                <p className="text-gray-500">
                  Address: {order.address.addressLine}, {order.address.area}, {order.address.city}
                </p>
                <p className="font-bold text-gray-900">
                  Total Amount: ₹{order.total} • {order.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
