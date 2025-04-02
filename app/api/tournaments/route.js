import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Używamy klucza serwisowego – upewnij się, że SUPABASE_SERVICE_ROLE_KEY jest ustawiony
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nazwa,
      typ,
      miasto,
      wojewodztwo,
      limit_miejsc,
      data_turnieju,
      is_kolejka,
      ilosc_kolejek,
      konfiguracja, // opcjonalny obiekt, np. { rounds: [ { round_nr, liczba_partii, final_round }, ... ] }
    } = body;

    
    // Wstaw rekord do tabeli tournaments
    const { data: tournData, error: tournError } = await supabase
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
          konfiguracja: konfiguracja ? konfiguracja : null,
        },
      ])
      .select();

    if (tournError) {
      return NextResponse.json({ error: tournError.message }, { status: 500 });
    }

    const tournamentId = tournData[0].id;

    // Jeśli przekazano konfigurację rund (np. obiekt konfiguracja.rounds to tablica)
    if (konfiguracja && konfiguracja. && konfiguracja.rounds.length > 0) {
      // Iterujemy po tablicy rund i wstawiamy rekordy do tabeli rounds
      for (let r of konfiguracja.rounds) {
        const { round_nr, liczba_partii, final_round } = r;
        const { error: roundError } = await supabase
          .from("runda")
          .insert([
            {
              tournament_id: tournamentId,
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

    return NextResponse.json({ data: tournData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
