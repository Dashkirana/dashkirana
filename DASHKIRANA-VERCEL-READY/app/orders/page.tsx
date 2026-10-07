'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '../../components/BottomNav';
import { Order } from '../../lib/types';
import { getOrders } from '../../lib/services/store';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const data = await getOrders();
      setOrders(data);
    }
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl">
      <div className="bg-white p-4 border-b border-gray-100">
        <h1 className="font-extrabold text-base text-gray-900">Your Orders</h1>
      </div>

      <div className="p-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">No orders placed yet.</div>
        ) : (
          orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block bg-white p-4 rounded-2xl border border-gray-100 space-y-2 hover:shadow-xs transition">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-gray-900">Order #{o.id}</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">{o.status}</span>
              </div>
              <div className="text-[11px] text-gray-500">
                {o.items.length} Items • ₹{o.total}
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
