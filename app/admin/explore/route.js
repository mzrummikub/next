import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  
  // Dozwolone tabele – aby zabezpieczyć przed SQL injection
  const allowedTables = ["auth.users", "users", "gracz"];
  if (!table || !allowedTables.includes(table)) {
    return NextResponse.json({ error: "Nieprawidłowa tabela" }, { status: 400 });
  }
  
  let query;
  if (table === "auth.users") {
    query = supabase.from("auth.users").select("*");
  } else {
    query = supabase.from(table).select("*");
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
