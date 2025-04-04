import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego (SERVICE ROLE KEY), aby mieć pełne uprawnienia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { id, email, login } = await request.json();
    // Wstaw rekord do tabeli "users"
    const { data, error } = await supabase
      .from("users")
      .insert([{ id, email, login }]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
