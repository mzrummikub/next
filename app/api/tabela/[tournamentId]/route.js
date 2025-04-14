import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req, context) {
  // Rozwiązujemy obiekt params używając Promise.resolve (aby Next.js uznał, że czekamy na params)
  const params = await Promise.resolve(context.params);
  const tournamentId = params.tournamentId;

  if (!tournamentId) {
    return NextResponse.json({ error: "Brak ID turnieju." }, { status: 400 });
  }

  // Pobieramy dane turnieju z tabeli "tournaments" na podstawie przekazanego ID
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, city, region, start_date, max_players, total_rounds")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json({ error: "Nie znaleziono turnieju." }, { status: 500 });
  }

  // Zwracamy dane turnieju oraz liczbę rund (pole total_rounds)
  return NextResponse.json({
    tournament,
    totalRounds: tournament.total_rounds,
    players: [], // Możesz dostosować tę część – opcjonalnie zwrócić lub usunąć tablicę graczy.
  });
}

