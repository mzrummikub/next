import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Używamy klucza serwisowego – upewnij się, że zmienna w .env.local jest poprawna
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const {
      name,
      type,
      city,
      region,
      start_date,
      max_players,
      total_rounds,
      has_final,
    } = await request.json();

    // Konfiguracja danych – dla turniejów typu league nie używamy total_rounds ani has_final
    const tournamentData = {
      name,
      type,
      city,
      region,
      start_date, // zakładamy, że format daty jest zgodny z oczekiwaniami PostgreSQL (YYYY-MM-DD)
      max_players,
      total_rounds: type !== "league" ? total_rounds : null,
      has_final: type !== "league" ? has_final : false,
    };

    const { data, error } = await supabase
      .from("tournament")
      .insert([tournamentData])
      .select();

    if (error) {
      console.error("Błąd przy tworzeniu turnieju:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tournament: data[0] });
  } catch (err) {
    console.error("Wewnętrzny błąd serwera:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
