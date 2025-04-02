import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego – upewnij się, że masz ustawioną zmienną SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    // Dane turnieju
    const {
      nazwa,
      typ,
      miasto,
      wojewodztwo,
      limit_miejsc,
      data_turnieju,
      is_kolejka,
      ilosc_kolejek,
      rundy // tablica obiektów: [{ round_nr, liczba_partii, final_round }, ...]
    } = body;

    // Wstaw turniej do tabeli turniej
    const { data: turniejData, error: turniejError } = await supabase
      .from("turniej")
      .insert([
        {
          nazwa,
          typ,
          miasto,
          wojewodztwo,
          limit_miejsc,
          data_turnieju: data_turnieju || null,
          is_kolejka,
          ilosc_kolejek: is_kolejka ? ilosc_kolejek : null,
        },
      ])
      .select();
      
    if (turniejError) {
      return NextResponse.json({ error: turniejError.message }, { status: 500 });
    }

    const turniejId = turniejData[0].id;

    // Jeśli przesłano konfigurację rund, wstaw rekordy do tabeli runda
    if (rundy && rundy.length > 0) {
      for (let r of rundy) {
        const { round_nr, liczba_partii, final_round } = r;
        const { error: roundError } = await supabase
          .from("runda")
          .insert([
            {
              turniej_id: turniejId,
              round_nr,
              liczba_partii,
              final_round,
            },
          ]);
        if (roundError) {
          return NextResponse.json({ error: roundError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ data: turniejData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
