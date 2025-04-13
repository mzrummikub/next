import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req, { params }) {
  const tournamentId = params.tournamentId;

  if (!tournamentId) {
    return NextResponse.json({ error: "Brak ID turnieju." }, { status: 400 });
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, city, region, start_date, max_players, total_rounds")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return NextResponse.json({ error: "Nie znaleziono turnieju." }, { status: 500 });
  }

  return NextResponse.json({
    tournament,
    totalRounds: tournament.total_rounds,
    players: [], // opcjonalnie: [] lub zostaw tylko tournament
  });
}
