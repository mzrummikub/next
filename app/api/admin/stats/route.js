import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego – upewnij się, że zmienna SUPABASE_SERVICE_ROLE_KEY jest ustawiona
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  const stats = {};

  // Liczba rekordów w auth.users – pamiętaj, że auth.users znajduje się w schemacie "auth"
  const { count: authUsersCount, error: countAuthError } = await supabase
    .from("auth.users")
    .select("*", { count: "exact", head: true });
  stats.authUsers = countAuthError ? "Error: " + countAuthError.message : authUsersCount;

  // Liczba rekordów w users
  const { count: usersCount, error: countUsersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  stats.users = countUsersError ? "Error: " + countUsersError.message : usersCount;

  // Liczba rekordów w gracz
  const { count: graczCount, error: countGraczError } = await supabase
    .from("gracz")
    .select("*", { count: "exact", head: true });
  stats.gracz = graczCount ?? (countGraczError ? "Error: " + countGraczError.message : 0);

  return NextResponse.json({ stats });
}
