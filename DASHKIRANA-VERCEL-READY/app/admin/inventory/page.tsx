'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '../../../lib/types';
import { getProducts, updateStock } from '../../../lib/services/store';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    await updateStock(id, newStock);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-gray-900">Inventory Tracker</h1>
            <p className="text-xs text-gray-500">Quick stock modifier for daily store reconciliation</p>
          </div>
          <Link href="/admin" className="text-xs font-bold text-emerald-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => {
            const isOutOfStock = p.stock === 0;
            const isLowStock = p.stock > 0 && p.stock <= 5;

            return (
              <div key={p.id} className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl">{p.image}</span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{p.name}</h3>
                    <span className="text-[10px] text-gray-500 block">{p.unit} • ₹{p.price}</span>
                    {isOutOfStock && <span className="text-[10px] font-bold text-red-600 block">Out of Stock</span>}
                    {isLowStock && <span className="text-[10px] font-bold text-amber-600 block">Low Stock</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleStockChange(p.id, p.stock - 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-gray-700 hover:bg-gray-200">
                    -
                  </button>
                  <input
                    type="number"
                    value={p.stock}
                    onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                    className="w-12 text-center font-bold text-xs bg-gray-50 border border-gray-200 py-1 rounded-md"
                  />
                  <button onClick={() => handleStockChange(p.id, p.stock + 1)} className="w-7 h-7 rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700">
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
