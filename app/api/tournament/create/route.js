import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client po stronie API
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

export async function POST(req) {
  try {
    // 🛡 Pobranie i weryfikacja tokena
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Brak tokena uwierzytelniającego." }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Nieautoryzowany dostęp." }, { status: 401 });
    }

    // 🧑‍💼 Sprawdzenie rangi użytkownika
    const { data: userInfo, error: userInfoError } = await supabase
      .from("users")
      .select("ranga")
      .eq("id", user.id)
      .single();

    if (userInfoError || !userInfo || userInfo.ranga !== "admin") {
      return NextResponse.json({ error: "Tylko administrator może zakładać turnieje." }, { status: 403 });
    }

    // 📥 Parsowanie danych z żądania
    const body = await req.json();
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

    // 💾 Zapis do tabeli turniejów
    const { data: tournament, error: insertError } = await supabase
      .from("tournaments")
      .insert({
        name,
        type,
        city,
        region,
        start_date,
        max_players,
        total_rounds,
        has_final,
        final_games_count: has_final ? final_games_count : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 💾 Zapis rund turnieju
    const roundsToInsert = roundsConfig.map((round) => ({
      tournament_id: tournament.id,
      round_number: round.round_number,
      games_in_round: round.games_in_round,
    }));

    const { error: roundsError } = await supabase
      .from("tournament_rounds")
      .insert(roundsToInsert);

    if (roundsError) {
      return NextResponse.json({ error: roundsError.message }, { status: 500 });
    }

    // ✅ Sukces
    return NextResponse.json({ success: true, tournament_id: tournament.id }, { status: 200 });

  } catch (error) {
    console.error("❌ Błąd serwera:", error);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera." }, { status: 500 });
  }
}
