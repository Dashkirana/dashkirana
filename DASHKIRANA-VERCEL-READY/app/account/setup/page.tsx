'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MapPin, User, Phone, Home, Loader2 } from 'lucide-react'

export default function AccountSetupPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    houseNumber: '',
    street: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    deliveryInstructions: '',
  })

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const metadata = user.user_metadata || {}

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle()

    setForm((prev) => ({
      ...prev,
      fullName:
        profile?.full_name ||
        metadata.full_name ||
        metadata.name ||
        '',
      phone: profile?.phone || '',
    }))

    setLoading(false)
  }

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError('')

    const requiredFields = [
      form.fullName,
      form.phone,
      form.houseNumber,
      form.street,
      form.locality,
      form.city,
      form.state,
      form.pincode,
    ]

    if (requiredFields.some((field) => !field.trim())) {
      setError('Please fill all required fields.')
      return
    }

    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Please enter a valid 6-digit pincode.')
      return
    }

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const cleanPhone = form.phone.replace(/\D/g, '')

      // Save customer profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: form.fullName.trim(),
            phone: cleanPhone,
          },
          {
            onConflict: 'id',
          }
        )

      if (profileError) {
        throw new Error(profileError.message)
      }

      // Check for an existing address
      const { data: existingAddress } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      let addressError

      if (existingAddress?.id) {
        const result = await supabase
          .from('addresses')
          .update({
            label: 'Home',
            full_name: form.fullName.trim(),
            phone: cleanPhone,
            house_number: form.houseNumber.trim(),
            street: form.street.trim(),
            locality: form.locality.trim(),
            landmark: form.landmark.trim() || null,
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            delivery_instructions:
              form.deliveryInstructions.trim() || null,
            is_default: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAddress.id)

        addressError = result.error
      } else {
        const result = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            label: 'Home',
            full_name: form.fullName.trim(),
            phone: cleanPhone,
            house_number: form.houseNumber.trim(),
            street: form.street.trim(),
            locality: form.locality.trim(),
            landmark: form.landmark.trim() || null,
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
            delivery_instructions:
              form.deliveryInstructions.trim() || null,
            is_default: true,
          })

        addressError = result.error
      }

      if (addressError) {
        throw new Error(addressError.message)
      }

      // Keep existing DashKirana local data working
      localStorage.setItem(
        'dashkirana_user',
        JSON.stringify({
          id: user.id,
          name: form.fullName.trim(),
          phone: cleanPhone,
        })
      )

      window.dispatchEvent(
        new Event('dashkirana_data_changed')
      )

      router.replace('/')
      router.refresh()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )

      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
            <MapPin className="w-7 h-7 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-black text-gray-900">
            Add your delivery address
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            We need this to deliver your groceries.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4"
        >

          <div>
            <label className="text-xs font-bold text-gray-700">
              Full Name *
            </label>

            <div className="relative mt-1">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                value={form.fullName}
                onChange={(e) =>
                  updateField('fullName', e.target.value)
                }
                placeholder="Your full name"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Phone Number *
            </label>

            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    'phone',
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <h2 className="font-black text-gray-900 text-sm">
              Delivery Address
            </h2>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              House / Flat Number *
            </label>

            <input
              value={form.houseNumber}
              onChange={(e) =>
                updateField('houseNumber', e.target.value)
              }
              placeholder="Example: 12-4-25"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Street / Road *
            </label>

            <input
              value={form.street}
              onChange={(e) =>
                updateField('street', e.target.value)
              }
              placeholder="Street or road name"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Locality / Area *
            </label>

            <input
              value={form.locality}
              onChange={(e) =>
                updateField('locality', e.target.value)
              }
              placeholder="Example: Gandhi Nagar"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Landmark
            </label>

            <input
              value={form.landmark}
              onChange={(e) =>
                updateField('landmark', e.target.value)
              }
              placeholder="Nearby landmark (optional)"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-xs font-bold text-gray-700">
                City *
              </label>

              <input
                value={form.city}
                onChange={(e) =>
                  updateField('city', e.target.value)
                }
                placeholder="City"
                className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">
                State *
              </label>

              <input
                value={form.state}
                onChange={(e) =>
                  updateField('state', e.target.value)
                }
                placeholder="State"
                className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Pincode *
            </label>

            <input
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={(e) =>
                updateField(
                  'pincode',
                  e.target.value.replace(/\D/g, '')
                )
              }
              placeholder="6-digit pincode"
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              Delivery Instructions
            </label>

            <textarea
              value={form.deliveryInstructions}
              onChange={(e) =>
                updateField(
                  'deliveryInstructions',
                  e.target.value
                )
              }
              placeholder="Example: Call when you arrive"
              rows={3}
              className="w-full mt-1 px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                Save Address & Continue
              </>
            )}
          </button>

        </form>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Your address is securely saved to your DashKirana account.
        </p>

      </div>
    </main>
  )
}
