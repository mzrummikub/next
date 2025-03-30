import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required", exists: false }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Pobierz listę użytkowników z auth i sprawdź, czy email już istnieje
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message, exists: false }, { status: 500 });
  }
  const exists = data.users.some((user) => user.email === email);
  return NextResponse.json({ exists });
}
