'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryName } from '../../../../lib/types';
import { addProduct } from '../../../../lib/services/store';
import { supabase } from '../../../../lib/supabase/client';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<CategoryName>('Rice & Grains');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [stock, setStock] = useState('20');
  const [description, setDescription] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const [featured, setFeatured] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Allow only image files
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    if (!price) {
      alert('Please enter the selling price.');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = '🛒';

      // Upload product image
      if (imageFile) {
        const fileExt =
          imageFile.name.split('.').pop() || 'jpg';

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const filePath = `products/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from('product-images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false,
            });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(
            'Could not upload the product image.'
          );
        }

        const { data: publicUrlData } =
          supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const pPrice = Number(price);
      const pMrp = Number(mrp) || pPrice;

      const discount =
        pMrp > pPrice
          ? Math.round(((pMrp - pPrice) / pMrp) * 100)
          : 0;

      await addProduct({
        name: name.trim(),
        slug: name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-'),
        categoryId: 'cat-custom',
        category,
        description,
        price: pPrice,
        mrp: pMrp,
        discount,
        unit,
        stock: Number(stock),
        image: imageUrl,
        featured,
        active: true,
      });

      alert('Product added successfully!');

      router.push('/admin/products');
    } catch (error) {
      console.error('Add product error:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to add product.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h1 className="text-lg font-black text-gray-900">
          Add New Grocery Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 text-xs"
        >
          {/* Product Name */}
          <div>
            <label className="font-bold block mb-1">
              Product Name
            </label>

            <input
              required
              type="text"
              placeholder="e.g. Fortune Sunflower Oil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border p-2 rounded-lg"
            />
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as CategoryName
                  )
                }
                className="w-full bg-gray-50 border p-2 rounded-lg"
              >
                <option value="Rice & Grains">
                  Rice & Grains
                </option>
                <option value="Dals">Dals</option>
                <option value="Oils">Oils</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">
                  Beverages
                </option>
                <option value="Dairy">Dairy</option>
                <option value="Fruits & Vegetables">
                  Fruits & Vegetables
                </option>
                <option value="Personal Care">
                  Personal Care
                </option>
                <option value="Household">
                  Household
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">
                Unit / Size
              </label>

              <input
                required
                type="text"
                placeholder="e.g. 1 kg / 500 ml"
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value)
                }
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>
          </div>

          {/* Price / MRP / Stock */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold block mb-1">
                Selling Price (₹)
              </label>

              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">
                MRP (₹)
              </label>

              <input
                type="number"
                min="0"
                value={mrp}
                onChange={(e) =>
                  setMrp(e.target.value)
                }
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">
                Initial Stock
              </label>

              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                className="w-full bg-gray-50 border p-2 rounded-lg"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold block mb-1">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full bg-gray-50 border p-2 rounded-lg"
              rows={2}
              placeholder="Enter product description..."
            />
          </div>

          {/* Product Image */}
          <div>
            <label className="font-bold block mb-1">
              Product Image
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-32 h-32 object-contain rounded-xl bg-white border"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="w-full bg-red-50 text-red-600 font-bold py-2 rounded-lg"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center">
                  <div className="text-3xl mb-2">
                    📸
                  </div>

                  <div className="font-bold text-gray-800">
                    Choose Product Image
                  </div>

                  <div className="text-gray-500 mt-1">
                    JPG, PNG or WEBP • Max 5 MB
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="feat"
              checked={featured}
              onChange={(e) =>
                setFeatured(e.target.checked)
              }
            />

            <label
              htmlFor="feat"
              className="font-bold"
            >
              Mark as Featured Product
            </label>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-emerald-600 text-white font-extrabold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading
              ? 'Uploading & Saving...'
              : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
