import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");

  if (!table) {
    return NextResponse.json({ error: "Nie podano nazwy tabeli." }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from(table).select("*").limit(1000); // limit dla bezpieczeństwa
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
