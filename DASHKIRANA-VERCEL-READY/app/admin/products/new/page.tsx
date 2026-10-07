'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryName } from '../../../../lib/types';
import { addProduct } from '../../../../lib/services/store';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryName>('Rice & Grains');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [stock, setStock] = useState('20');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('🛒');
  const [featured, setFeatured] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pPrice = Number(price);
    const pMrp = Number(mrp) || pPrice;
    const discount = pMrp > pPrice ? Math.round(((pMrp - pPrice) / pMrp) * 100) : 0;

    await addProduct({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      categoryId: 'cat-custom',
      category,
      description,
      price: pPrice,
      mrp: pMrp,
      discount,
      unit,
      stock: Number(stock),
      image,
      featured,
      active: true,
    });

    router.push('/admin/products');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h1 className="text-lg font-black text-gray-900">Add New Grocery Product</h1>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Product Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Fortune Sunflower Oil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border p-2 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryName)}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              >
                <option value="Rice & Grains">Rice & Grains</option>
                <option value="Dals">Dals</option>
                <option value="Oils">Oils</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Dairy">Dairy</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household">Household</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Unit / Size</label>
              <input
                required
                type="text"
                placeholder="e.g. 1 kg / 500 ml"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold block mb-1">Selling Price (₹)</label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">MRP (₹)</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Initial Stock</label>
              <input
                required
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border p-2 rounded-lg"
              rows={2}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Emoji Icon / Placeholder</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-gray-50 border p-2 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="feat"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <label htmlFor="feat" className="font-bold">
              Mark as Featured Product
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-extrabold py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
}
