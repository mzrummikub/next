import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Brak tokena autoryzacyjnego" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  // 🔍 Sprawdź w tabeli `users` czy ma rangę "admin"
  const { data: userInfo, error: infoError } = await supabase
    .from("users")
    .select("ranga")
    .eq("id", user.id)
    .single();

  if (infoError || userInfo?.ranga !== "admin") {
    return NextResponse.json({ error: "Dostęp tylko dla administratora" }, { status: 403 });
  }

  const body = await request.json();
  const {
    name,
    type,
    city,
    region,
    start_date,
    max_players,
    total_rounds,
    has_final,
    final_games_count,
    roundsConfig,
  } = body;

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournament")
    .insert([
      {
        name,
        type,
        city,
        region,
        start_date,
        max_players,
        total_rounds: type !== "league" ? total_rounds : null,
        has_final: type !== "league" ? has_final : false,
        final_games_count: has_final ? final_games_count : null,
      },
    ])
    .select()
    .single();

  if (tournamentError) {
    return NextResponse.json({ error: tournamentError.message }, { status: 500 });
  }

  const roundsToInsert = roundsConfig.map((round) => ({
    tournament_id: tournament.id,
    round_number: round.round_number,
    games_in_round: round.games_in_round,
    is_final: false,
  }));

  if (has_final && final_games_count) {
    roundsToInsert.push({
      tournament_id: tournament.id,
      round_number: total_rounds + 1,
      games_in_round: final_games_count,
      is_final: true,
    });
  }

  const { error: roundsError } = await supabase
    .from("tournament_rounds")
    .insert(roundsToInsert);

  if (roundsError) {
    return NextResponse.json({ error: roundsError.message }, { status: 500 });
  }

  return NextResponse.json({ tournament });
}
