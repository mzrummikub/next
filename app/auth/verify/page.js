import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Brak tokenu.' }, { status: 400 })
  }

  // Sprawdzenie tokenu
  const { data: userData, error: selectError } = await supabaseAdmin
    .from('user')
    .select('*')
    .eq('verification_token', token)
    .maybeSingle()

  if (selectError || !userData) {
    return NextResponse.json({ error: 'Niepoprawny lub nieistniejący token.' }, { status: 400 })
  }

  // Próba aktualizacji statusu konta w Supabase Auth
  const { data: updatedUser, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
    email_confirm: true,
  })

  if (confirmError) {
    console.error('Błąd potwierdzania konta:', confirmError)
    return NextResponse.json({ error: confirmError.message }, { status: 500 })
  }

  // Aktualizacja tabeli "user"
  const { error: updateError } = await supabaseAdmin
    .from('user')
    .update({ verification_token: null, verified: true })
    .eq('id', userData.id)

  if (updateError) {
    console.error('Błąd aktualizacji tabeli user:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.redirect('https://mzrummikub.vercel.app/login')
}
