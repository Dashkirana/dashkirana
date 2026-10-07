'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Customer } from '../../../lib/types';
import { getCustomers } from '../../../lib/services/store';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      const data = await getCustomers();
      setCustomers(data);
    }
    loadCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-gray-900">Customer Directory</h1>
            <p className="text-xs text-gray-500">Registered store shoppers and spending stats</p>
          </div>
          <Link href="/admin" className="text-xs font-bold text-emerald-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </header>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Total Orders</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">{c.name}</td>
                  <td className="p-3 text-gray-600">{c.phone}</td>
                  <td className="p-3 font-semibold">{c.totalOrders}</td>
                  <td className="p-3 font-extrabold text-emerald-700">₹{c.totalSpent}</td>
                  <td className="p-3 text-gray-400">{c.lastOrderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
