'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BottomNav } from '../../components/BottomNav';
import { User, MapPin, ShoppingBag, ShieldAlert, LogOut, ArrowRight, Edit2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashkirana_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setEditName(parsed.name || '');
        } catch {}
      }
    }
    setLoading(false);
  }, []);

  const handleSaveName = () => {
    if (!editName.trim() || !user) return;
    const updated = { ...user, name: editName.trim() };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashkirana_user', JSON.stringify(updated));
      window.dispatchEvent(new Event('dashkirana_data_changed'));
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashkirana_user');
      window.dispatchEvent(new Event('dashkirana_data_changed'));
    }
    if (process.env.NEXT_PUBLIC_DATA_MODE === 'supabase') {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    router.push('/login');
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl flex flex-col justify-between">
      <div>
        {user ? (
          <>
            {/* Logged in User Profile Banner */}
            <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200">
                  {getInitials(user.name)}
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold"
                        placeholder="Your name"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="font-extrabold text-base text-gray-900">
                        {user.name || 'DashKirana Customer'}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-emerald-600 p-0.5"
                        aria-label="Edit Name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-gray-500 font-medium">
                    +91 {user.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden text-xs font-bold text-gray-800 shadow-xs">
                <Link
                  href="/orders"
                  className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" /> My Orders
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>

                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Location (Park Road, Kurnool)
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <Link
                  href="/admin"
                  className="p-3.5 flex items-center justify-between bg-emerald-50/40 text-emerald-900 hover:bg-emerald-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" /> Switch to Shop Admin Panel
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 font-bold text-xs p-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition shadow-xs"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </>
        ) : (
          /* Guest Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-3xl">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">
                Welcome to DashKirana
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Sign in with your mobile number to view your past orders, manage delivery addresses and track orders.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm shadow-md transition"
            >
              Login / Sign Up
            </Link>

            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/admin"
                className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Shop Owner? Go to Admin Panel</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
