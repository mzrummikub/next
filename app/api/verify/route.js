import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu.' }, { status: 400 })
  }

  const { data: userData, error } = await supabaseAdmin
    .from('user')
    .select('*')
    .eq('verification_token', token)
    .single()

  if (error || !userData) {
    return NextResponse.json({ error: 'Niepoprawny token.' }, { status: 400 })
  }

  const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
    email_confirm: true,
  })

  if (confirmError) {
    return NextResponse.json({ error: confirmError.message }, { status: 500 })
  }

  await supabaseAdmin
    .from('user')
    .update({ verification_token: null, verified: true })
    .eq('id', userData.id)

  return NextResponse.redirect('https://mzrummikub.vercel.app/login')
}
