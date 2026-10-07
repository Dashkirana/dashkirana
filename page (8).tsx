'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, DollarSign, Package, AlertTriangle, ArrowRight, Users, Sparkles, Store } from 'lucide-react';
import { Order, Product } from '../../lib/types';
import { getOrders, getProducts } from '../../lib/services/store';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      const o = await getOrders();
      const p = await getProducts();
      setOrders(o);
      setProducts(p);
      setLoading(false);
    }
    loadAdminData();
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Admin Navigation Bar */}
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl font-black text-gray-900 tracking-tight">DASHKIRANA ADMIN</h1>
            </div>
            <p className="text-xs text-gray-500">Kurnool Store Control Center • Active Session</p>
          </div>

          <nav className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
            <Link href="/admin" className="px-3 py-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition">
              Orders
            </Link>
            <Link href="/admin/products" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition">
              Products
            </Link>
            <Link href="/admin/inventory" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition">
              Inventory
            </Link>
            <Link href="/admin/customers" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition">
              Customers
            </Link>
          </nav>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold text-gray-500">Total Sales</span>
            </div>
            <span className="text-xl font-black text-gray-900">₹{totalSales}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs font-bold text-gray-500">Pending Orders</span>
            </div>
            <span className="text-xl font-black text-gray-900">{pendingOrders.length}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Package className="w-5 h-5" />
              <span className="text-xs font-bold text-gray-500">Active Products</span>
            </div>
            <span className="text-xl font-black text-gray-900">{products.length}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-bold text-gray-500">Low Stock Alert</span>
            </div>
            <span className="text-xl font-black text-amber-600">{lowStockProducts.length}</span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-2xl p-4 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🏬
            </div>
            <div>
              <h3 className="font-bold text-sm">Store Live Management</h3>
              <p className="text-[11px] text-emerald-100">
                Quickly add groceries, update stock or view live orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/new"
              className="bg-white text-emerald-900 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:bg-emerald-50 transition"
            >
              + Add New Item
            </Link>
            <Link
              href="/"
              target="_blank"
              className="bg-emerald-600/60 hover:bg-emerald-600 border border-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" /> View Storefront
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-base text-gray-900">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-3 font-bold text-gray-900">{o.id}</td>
                      <td className="py-3">
                        <div className="font-semibold">{o.customerName}</div>
                        <div className="text-[10px] text-gray-400">{o.customerPhone}</div>
                      </td>
                      <td className="py-3 font-bold text-emerald-700">₹{o.total}</td>
                      <td className="py-3">{o.paymentMethod}</td>
                      <td className="py-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
