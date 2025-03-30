import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const login = searchParams.get("login");

  if (!login) {
    return NextResponse.json({ error: "Login is required", exists: false }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Sprawdź w tabeli "users", czy podany login już istnieje
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("login")
    .eq("login", login);

  if (error) {
    return NextResponse.json({ error: error.message, exists: false }, { status: 500 });
  }

  const exists = data.length > 0;
  return NextResponse.json({ exists });
}
