'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Chrome } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        throw loginError
      }

      if (!data.user) {
        throw new Error('Login failed. Please try again.')
      }

      const user = data.user

      // Check whether the customer already has an address
      const { data: address, error: addressError } =
        await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle()

      if (addressError) {
        console.error('Address check error:', addressError)
      }

      // Save basic local user information
      const metadata = user.user_metadata || {}

      localStorage.setItem(
        'dashkirana_user',
        JSON.stringify({
          id: user.id,
          name:
            metadata.full_name ||
            metadata.name ||
            user.email?.split('@')[0] ||
            'Customer',
          email: user.email || '',
        })
      )

      window.dispatchEvent(
        new Event('dashkirana_data_changed')
      )

      if (!address) {
        router.replace('/account/setup')
      } else {
        router.replace('/')
      }

      router.refresh()
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          'Unable to login. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)

    try {
      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

      if (googleError) {
        throw googleError
      }
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          'Google login failed. Please try again.'
      )

      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-2xl font-black">
              DK
            </span>
          </div>

          <h1 className="text-3xl font-black text-gray-900">
            Welcome to DashKirana
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Login to continue shopping
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 flex items-center justify-center gap-3 font-bold text-sm text-gray-800 transition"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Chrome className="w-5 h-5" />
            )}

            {googleLoading
              ? 'Connecting to Google...'
              : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-200 flex-1" />

            <span className="text-xs font-semibold text-gray-400">
              OR
            </span>

            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Email Login */}
          <form
            onSubmit={handleEmailLogin}
            className="space-y-4"
          >

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-700">
                Email
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-700">
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Register */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={() => router.push('/register')}
              className="mt-1 text-sm font-black text-emerald-600 hover:text-emerald-700"
            >
              Create an account
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Secure authentication powered by Supabase
        </p>
      </div>
    </main>
  )
}
