'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Clock, User } from 'lucide-react';

interface BottomNavProps {
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ cartCount = 0 }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products', icon: Grid },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Orders', href: '/orders', icon: Clock },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 max-w-md mx-auto">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white font-bold text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
