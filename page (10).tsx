'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Authentication failed.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized as a shop administrator.');
      }

      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 transition font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-600/30">⚡</div>
            <h1 className="text-xl font-black text-gray-900 mt-3 tracking-tight">Shop Admin Portal</h1>
            <p className="text-xs text-gray-500 mt-0.5">Secure access for the shop owner</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Admin Email</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black text-sm shadow-md transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In to Admin →'}
            </button>
          </form>

          <p className="text-[10px] text-center text-gray-400">Admin access is controlled by Supabase Auth and the admin role in the database.</p>
        </div>
      </div>
    </div>
  );
}
