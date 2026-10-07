import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  const supabase = await createClient()

  // Exchange Google OAuth code for a Supabase session
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Get the logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // Get Google profile information
  const metadata = user.user_metadata ?? {}

  const fullName =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    ''

  // Check whether profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  // Create profile for a new Google user.
  // Preserve an existing admin role.
  const profileData = {
    id: user.id,
    full_name: existingProfile?.full_name || fullName,
    phone: existingProfile?.phone || null,
    role: existingProfile?.role || 'customer',
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })

  if (profileError) {
    console.error('Profile error:', profileError)
    return NextResponse.redirect(`${origin}/login?error=profile`)
  }

  // Check whether the customer already has a saved address
  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (addressError) {
    console.error('Address check error:', addressError)
    return NextResponse.redirect(`${origin}/login?error=address`)
  }

  // New customer → complete delivery information
  if (!address) {
    return NextResponse.redirect(`${origin}/account/setup`)
  }

  // Existing customer → continue normally
  return NextResponse.redirect(`${origin}${next}`)
}
