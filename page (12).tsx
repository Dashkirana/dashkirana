'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';
import { Product } from '../../../lib/types';
import { getProducts, updateProduct } from '../../../lib/services/store';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (product: Product) => {
    await updateProduct(product.id, { active: !product.active });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-lg font-black text-gray-900">Product Catalog</h1>
            <p className="text-xs text-gray-500">Manage shop items and customer visibility</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="text-xs font-bold text-gray-600 px-3 py-2 border rounded-xl hover:bg-gray-50">
              ← Dashboard
            </Link>
            <Link href="/admin/products/new" className="text-xs font-bold text-white bg-emerald-600 px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price / MRP</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-2">
                    <span className="text-xl">{p.image}</span>
                    <div>
                      <span className="font-bold text-gray-900 block">{p.name}</span>
                      <span className="text-[10px] text-gray-400">{p.unit}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{p.category}</td>
                  <td className="p-3">
                    <span className="font-bold text-gray-900">₹{p.price}</span>
                    <span className="text-gray-400 line-through ml-1">₹{p.mrp}</span>
                  </td>
                  <td className="p-3 font-bold">{p.stock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {p.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3"><Link href={`/admin/products/${p.id}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Edit className="w-3 h-3"/>Edit</Link><button onClick={() => toggleActive(p)} className="text-xs font-bold text-emerald-600 hover:underline">{p.active ? 'Deactivate' : 'Activate'}</button></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
