'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md z-10">
          {product.discount}% OFF
        </span>
      )}

      {/* Product Visual Container */}
      <Link href={`/products/${product.id}`} className="block mb-2">
        <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-4xl mb-2 relative">
          {product.image}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <span className="text-[11px] text-gray-500 block font-medium">
          {product.unit}
        </span>
        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[32px] leading-snug">
          {product.name}
        </h3>
      </Link>

      {/* Price & Low Stock State */}
      <div>
        {isLowStock && (
          <span className="text-[10px] text-amber-600 font-bold block mb-1">
            Only {product.stock} left
          </span>
        )}

        <div className="flex items-end justify-between gap-1 mt-1">
          <div>
            <span className="text-sm font-extrabold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-gray-400 line-through ml-1 font-normal">
                ₹{product.mrp}
              </span>
            )}
          </div>

          {/* Quantity Controls or Add Button */}
          {cartQuantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg p-0.5">
              <button
                onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                className="w-6 h-6 rounded-md bg-white text-emerald-700 flex items-center justify-center shadow-xs font-bold hover:bg-emerald-100"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-emerald-900 px-1">
                {cartQuantity}
              </span>
              <button
                disabled={cartQuantity >= product.stock}
                onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-200 disabled:text-gray-400"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
