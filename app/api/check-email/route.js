import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicjalizujemy klienta z uprawnieniami serwisowymi
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email not provided" }, { status: 400 });
  }

  // Wykonujemy zapytanie do tabeli auth.users – pobieramy tylko kolumnę id
  const { data, error } = await supabaseAdmin
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Jeśli rekord został znaleziony, email istnieje
  if (data) {
    return NextResponse.json({ exists: true });
  } else {
    return NextResponse.json({ exists: false });
  }
}
