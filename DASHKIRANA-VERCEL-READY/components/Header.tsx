'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, MapPin, User, CheckCircle } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  searchQuery = '',
  onSearchChange,
}) => {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dashkirana_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    checkUser();
    window.addEventListener('dashkirana_data_changed', checkUser);
    window.addEventListener('focus', checkUser);
    return () => {
      window.removeEventListener('dashkirana_data_changed', checkUser);
      window.removeEventListener('focus', checkUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2.5 shadow-xs">
      <div className="max-w-md mx-auto flex flex-col gap-2">
        {/* Top Row: Logo, Location, Profile, Cart */}
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 block leading-none">
                DASH<span className="text-emerald-600">KIRANA</span>
              </span>
              <span className="text-[9px] text-gray-500 font-medium tracking-wide">
                Your Local Kirana, Online.
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={user ? '/account' : '/login'}
              className="flex items-center gap-1 p-1.5 text-gray-700 hover:text-emerald-600 transition rounded-xl hover:bg-gray-100"
              aria-label={user ? 'My Account' : 'Account Login'}
              title={user ? `Signed in as ${user.name}` : 'Login'}
            >
              <div className="relative">
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white" />
                )}
              </div>
              {user && (
                <span className="text-[11px] font-bold text-gray-800 max-w-[60px] truncate hidden sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-sm hover:bg-emerald-700 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-orange-500 text-white font-extrabold rounded-full w-4 h-4 text-[10px] flex items-center justify-center ml-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Location Banner */}
        <div className="flex items-center gap-1 text-xs text-gray-600 bg-emerald-50 px-2.5 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-gray-900">Delivering in 10 mins</span>
          <span className="text-gray-400">•</span>
          <span className="truncate">Park Road, Kurnool, AP</span>
        </div>

        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search atta, rice, oil, milk, maggi..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition"
            />
          </div>
        )}
      </div>
    </header>
  );
};
