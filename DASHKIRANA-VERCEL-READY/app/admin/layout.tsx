'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [ok, setOk] = useState(path === '/admin/login');

  useEffect(() => {
    let alive = true;

    const checkAccess = async () => {
      if (path === '/admin/login') {
        setOk(true);
        return;
      }

      // 1. Check local admin session in demo/mock mode.
      // In Supabase mode, require a real Supabase session + admin profile.
      if (process.env.NEXT_PUBLIC_DATA_MODE !== 'supabase' && typeof window !== 'undefined') {
        const localAdmin = localStorage.getItem('dashkirana_admin');
        if (localAdmin) {
          try {
            const parsed = JSON.parse(localAdmin);
            if (parsed && (parsed.role === 'admin' || parsed.phone)) {
              if (alive) setOk(true);
              return;
            }
          } catch {
            // invalid json, continue check
          }
        }
      }

      // 2. Check Supabase Auth user if in supabase mode
      if (process.env.NEXT_PUBLIC_DATA_MODE === 'supabase') {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            if (profile?.role === 'admin') {
              if (alive) setOk(true);
              return;
            }
          }
        } catch {
          // supabase check failed, proceed to redirect
        }
      }

      // If not authenticated, redirect to admin login
      if (alive) {
        setOk(false);
        router.replace('/admin/login');
      }
    };

    checkAccess();

    return () => {
      alive = false;
    };
  }, [path, router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-700">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (path === '/admin/login') return children;

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashkirana_admin');
    }
    if (process.env.NEXT_PUBLIC_DATA_MODE === 'supabase') {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    router.replace('/admin/login');
  };

  return (
    <div>
      <div className="sticky top-0 z-50 bg-gray-950 text-white px-4 py-2.5 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              ⚡
            </div>
            <Link href="/admin" className="font-black text-sm tracking-tight hover:text-emerald-400 transition">
              DASHKIRANA ADMIN
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              <span>←</span> Back to Store
            </Link>
            <button
              onClick={logout}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2.5 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
