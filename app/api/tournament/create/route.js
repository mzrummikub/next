import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client po stronie API (używamy klucza serwisowego)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    console.log("🚀 [API] Rozpoczynam obsługę CreateTournament POST");

    // 🛡 Pobranie i weryfikacja tokena
    const authHeader = req.headers.get("authorization");
    console.log("🔑 [API] Authorization header:", authHeader);
    const token = authHeader?.split(" ")[1];
    console.log("🔑 [API] Token:", token);

    if (!token) {
      console.warn("⚠️ [API] Brak tokena");
      return NextResponse.json(
        { error: "Brak tokena uwierzytelniającego." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    console.log("👤 [API] Supabase getUser:", { user, authError });

    if (authError || !user) {
      console.warn("⛔️ [API] Nieautoryzowany dostęp (getUser)");
      return NextResponse.json(
        { error: "Nieautoryzowany dostęp." },
        { status: 401 }
      );
    }

    // 🧑‍💼 Sprawdzenie rangi użytkownika w tabeli users
    const { data: userInfo, error: userInfoError } = await supabase
      .from("users")
      .select("ranga")
      .eq("id", user.id)
      .single();
    console.log("🔍 [API] users.ranga:", { userInfo, userInfoError });

    if (userInfoError || !userInfo || userInfo.ranga !== "admin") {
      console.warn("⛔️ [API] Brak odpowiedniej rangi:", userInfo?.ranga);
      return NextResponse.json(
        { error: "Tylko administrator może zakładać turnieje." },
        { status: 403 }
      );
    }

    // 📥 Parsowanie danych z żądania
    const body = await req.json();
    console.log("📥 [API] Body request:", body);
    const {
      name,
      ranga,
      city,
      region,
      start_date,
      max_players,
      total_rounds,
      has_final,
      final_games_count,
      roundsConfig,
    } = body;

    // 💾 Zapis do tabeli tournaments
    const { data: tournament, error: insertError } = await supabase
      .from("tournaments")
      .insert({
        name,
        ranga,
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
    console.log("💾 [API] Wynik insert tournaments:", { tournament, insertError });

    if (insertError) {
      console.error("❌ [API] Błąd insert tournaments:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 💾 Zapis rund w tabeli tournament_rounds
    const roundsToInsert = roundsConfig.map((round) => ({
      tournament_id: tournament.id,
      round_number: round.round_number,
      games_in_round: round.games_in_round,
    }));
    console.log("💾 [API] roundsToInsert:", roundsToInsert);

    const { error: roundsError } = await supabase
      .from("tournament_rounds")
      .insert(roundsToInsert);
    console.log("💾 [API] Wynik insert tournament_rounds error:", roundsError);

    if (roundsError) {
      console.error("❌ [API] Błąd insert tournament_rounds:", roundsError.message);
      return NextResponse.json({ error: roundsError.message }, { status: 500 });
    }

    // ✅ Sukces
    console.log("✅ [API] Turniej utworzony pomyślnie, ID:", tournament.id);
    return NextResponse.json(
      { success: true, tournament_id: tournament.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [API] Wewnętrzny błąd serwera:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera." },
      { status: 500 }
    );
  }
}
