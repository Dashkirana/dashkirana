```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

const isSupabaseMode =
  process.env.NEXT_PUBLIC_DATA_MODE === 'supabase';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load previously saved customer information
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashkirana_user');

      if (saved) {
        try {
          const u = JSON.parse(saved);

          if (u.phone) {
            setPhone(u.phone);
          }

          if (u.name) {
            setName(u.name);
          }
        } catch {
          // Ignore invalid localStorage data
        }
      }
    }
  }, []);

  // =========================================================
  // PHONE OTP
  // =========================================================

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    if (!isSupabaseMode) {
      setError(
        'Customer authentication is not configured. Set NEXT_PUBLIC_DATA_MODE=supabase.'
      );
      setLoading(false);
      return;
    }

    try {
      const { error: sbError } =
        await supabase.auth.signInWithOtp({
          phone: `+91${cleanPhone}`,
        });

      if (sbError) {
        throw sbError;
      }

      setOtp('');
      setStep('otp');
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    if (!isSupabaseMode) {
      setError(
        'Customer authentication is not configured. Set NEXT_PUBLIC_DATA_MODE=supabase.'
      );
      setLoading(false);
      return;
    }

    try {
      const { error: sbError } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',

          options: {
            // IMPORTANT:
            // Send Google OAuth back to our Supabase
            // callback route instead of directly to "/".
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (sbError) {
        throw sbError;
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Unable to continue with Google. Please try again.'
      );
      setLoading(false);
    }
  };

  // =========================================================
  // VERIFY PHONE OTP
  // =========================================================

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const finalName = name.trim() || 'Customer';

    if (!isSupabaseMode) {
      setError(
        'Customer authentication is not configured.'
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error: sbError } =
        await supabase.auth.verifyOtp({
          phone: `+91${cleanPhone}`,
          token: otp.trim(),
          type: 'sms',
        });

      if (sbError) {
        setError(sbError.message);
        setLoading(false);
        return;
      }

      // Create/update customer profile
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: finalName,
            phone: cleanPhone,
            role: 'customer',
          });
        } catch {
          // Don't block login if profile update fails
        }
      }

      // Save local customer information
      if (typeof window !== 'undefined') {
        const userObj = {
          phone: cleanPhone,
          name: finalName,
          id: data?.user?.id || `user-${cleanPhone}`,
          loggedInAt: new Date().toISOString(),
        };

        localStorage.setItem(
          'dashkirana_user',
          JSON.stringify(userObj)
        );

        window.dispatchEvent(
          new Event('dashkirana_data_changed')
        );
      }

      router.push('/');
    } catch (err: any) {
      setError(
        err?.message ||
          'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto flex flex-col justify-between customer-shell">

      <div>

        {/* Header navigation */}
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => {
              if (step === 'otp') {
                setStep('phone');
              } else {
                router.back();
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {step === 'phone'
              ? 'Step 1 of 2'
              : 'Step 2 of 2'}
          </span>

        </div>

        {/* Branding */}
        <div className="text-center mb-6">

          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-600/20">
            ⚡
          </div>

          <h1 className="text-xl font-black text-gray-900 mt-3 tracking-tight">
            Login to DashKirana
          </h1>

          <p className="text-xs text-gray-500 mt-0.5">
            Order fresh groceries directly from your local store.
          </p>

        </div>

        {/* Form container */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">

          {step === 'phone' ? (

            <form
              onSubmit={handleSendOtp}
              className="space-y-4"
            >

              {/* Phone number */}
              <div>

                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number
                </label>

                <div className="relative flex items-center">

                  <span className="absolute left-3 text-xs font-bold text-gray-500 border-r pr-2 border-gray-200">
                    +91
                  </span>

                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10)
                      )
                    }
                    className="w-full pl-14 pr-3 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />

                </div>

                <p className="text-[11px] text-gray-400 mt-1">
                  Works with any mobile number.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">

                  <AlertCircle className="w-4 h-4 shrink-0" />

                  <span>{error}</span>

                </div>
              )}

              {/* Get OTP */}
              <button
                type="submit"
                disabled={
                  loading ||
                  phone.replace(/\D/g, '').length !== 10
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm shadow-md transition disabled:opacity-50"
              >
                {loading
                  ? 'Sending OTP...'
                  : 'Get OTP →'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">

                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  or
                </span>

                <div className="h-px flex-1 bg-gray-200" />

              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 py-3.5 rounded-xl font-black text-sm transition disabled:opacity-50 flex items-center justify-center gap-3"
              >

                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-[13px] font-bold">
                  G
                </span>

                {loading
                  ? 'Connecting...'
                  : 'Continue with Google'}

              </button>

            </form>

          ) : (

            <form
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >

              {/* Name */}
              <div>

                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name (e.g., Priya Verma)"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />

              </div>

              {/* OTP */}
              <div>

                <div className="flex justify-between items-center mb-1">

                  <label className="text-xs font-bold text-gray-700">
                    6-Digit Verification OTP
                  </label>

                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[11px] text-emerald-600 hover:underline font-bold"
                  >
                    Change Number
                  </button>

                </div>

                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter the OTP sent to your phone"
                  className="w-full text-center tracking-widest border border-gray-200 bg-gray-50 rounded-xl p-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />

                <p className="text-[11px] text-gray-400 text-center mt-1">
                  Sent to +91 {phone}
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">

                  <AlertCircle className="w-4 h-4 shrink-0" />

                  <span>{error}</span>

                </div>
              )}

              {/* Verify */}
              <button
                type="submit"
                disabled={
                  loading || otp.length !== 6
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm shadow-md transition disabled:opacity-50"
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify & Continue →'}
              </button>

            </form>

          )}

        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-400 py-4 flex items-center justify-center gap-1.5">

        <ShieldCheck className="w-4 h-4 text-emerald-600" />

        <span>
          Safe & Secure Local Login • DashKirana
        </span>

      </div>

    </div>
  );
}
```
