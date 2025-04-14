import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req, context) {
  // Rozwiązujemy obiekt params i logujemy otrzymane parametry
  const params = await Promise.resolve(context.params);
  console.log("Otrzymane params:", params);
  
  const tournamentId = params.tournamentId;
  
  if (!tournamentId) {
    console.error("Brak ID turnieju w parametrach:", params);
    return NextResponse.json({ error: "Brak ID turnieju." }, { status: 400 });
  }
  
  console.log("Pobieramy turniej dla ID:", tournamentId);
  
  // Zapytanie do Supabase o turniej
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, city, region, start_date, max_players, total_rounds")
    .eq("id", tournamentId)
    .single();
  
  console.log("Odpowiedź z Supabase:", { tournament, tournamentError });
  
  if (tournamentError || !tournament) {
    console.error("Błąd przy pobieraniu turnieju:", tournamentError);
    return NextResponse.json({ error: "Nie znaleziono turnieju." }, { status: 500 });
  }
  
  console.log("Turniej pobrany poprawnie:", tournament);
  
  const responseData = {
    tournament,
    totalRounds: tournament.total_rounds,
    players: [], // lub dalsze przetwarzanie graczy, jeśli wymagane
  };
  
  console.log("Wysyłamy odpowiedź:", responseData);
  return NextResponse.json(responseData);
}
