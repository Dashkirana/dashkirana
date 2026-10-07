'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { ProductCard } from '../components/ProductCard';
import { Product, Category, CartItem } from '../lib/types';
import { getProducts, getCategories, searchProducts } from '../lib/services/store';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      setCategories(cats);
      const prods = await getProducts();
      setProducts(prods);
    }
    loadData();

    // Load persisted cart
    const savedCart = localStorage.getItem('dashkirana_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('dashkirana_cart', JSON.stringify(updatedCart));
  };

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      handleUpdateQuantity(product.id, existing.quantity + 1);
    } else {
      saveCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter((item) => item.product.id !== productId));
    } else {
      saveCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl">
      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="px-4 pt-3 space-y-6">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-[220px]">
            <span className="bg-orange-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full inline-block mb-2">
              Kurnool Local Express
            </span>
            <h1 className="text-xl font-extrabold leading-tight">
              Groceries delivered from your local store.
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Fresh everyday essentials at neighborhood shop prices.
            </p>
            <Link
              href="/products"
              className="inline-block mt-3 bg-white text-emerald-800 font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-50 transition"
            >
              Shop Now →
            </Link>
          </div>
          <div className="absolute -right-2 -bottom-2 text-7xl opacity-20 pointer-events-none select-none">
            🛒
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Categories</h2>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                selectedCategory === 'All'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <span>🛍️</span> All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  selectedCategory === cat.name
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">
              {selectedCategory === 'All' ? 'Popular Right Now' : selectedCategory}
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {filteredProducts.length} Items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 my-4">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-bold text-gray-800 text-sm">
                No matching items found
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for standard groceries like "rice", "atta", or "oil".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((i) => i.product.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cartItem ? cartItem.quantity : 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Why DashKirana Banner */}
        <section className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
          <h3 className="font-bold text-sm text-gray-900">Why DashKirana?</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">🏬</span>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Trusted Store</h4>
                <p className="text-[10px] text-gray-500">
                  Directly from your local neighborhood kirana.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Fast Delivery</h4>
                <p className="text-[10px] text-gray-500">
                  Delivered right to your doorstep in 10 mins.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav cartCount={cartCount} />
    </div>
  );
}
