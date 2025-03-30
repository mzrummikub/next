import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required', exists: false }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Inicjalizacja klienta Supabase z kluczem serwisowym
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Sprawdzenie, czy użytkownik o danym emailu istnieje
  const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
  if (error) {
    return NextResponse.json({ error: error.message, exists: false }, { status: 500 });
  }

  const exists = data.user ? true : false;

  return NextResponse.json({ exists });
}
