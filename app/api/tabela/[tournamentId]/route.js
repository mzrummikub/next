import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET – pobiera szczegóły turnieju oraz rekordy rund z tabeli tournament_rounds
export async function GET(req, context) {
  const params = await Promise.resolve(context.params);
  console.log("GET - Otrzymane params:", params);

  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    console.error("GET - Brak ID turnieju w parametrach:", params);
    return NextResponse.json({ error: "Brak ID turnieju." }, { status: 400 });
  }
  console.log("GET - Pobieramy turniej dla ID:", tournamentId);

  // Pobierz dane turnieju z tabeli "tournaments"
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      id, 
      name, 
      ranga, 
      city, 
      region, 
      start_date, 
      max_players, 
      total_rounds,
      has_final,
      final_games_count
    `)
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    console.error("GET - Błąd przy pobieraniu turnieju:", tournamentError);
    return NextResponse.json({ error: "Nie znaleziono turnieju." }, { status: 500 });
  }

  // Pobierz rekordy rund z tabeli "tournament_rounds"
  const { data: roundsData, error: roundsError } = await supabase
    .from("tournament_rounds")
    .select("round_number, games_in_round, name")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true });

  if (roundsError) {
    console.error("GET - Błąd przy pobieraniu rund:", roundsError);
    return NextResponse.json({ error: "Błąd pobierania rund." }, { status: 500 });
  }

  const responseData = {
    tournament,
    totalRounds: tournament.total_rounds,
    rounds: roundsData || [],
    has_final: tournament.has_final,
    final_games_count: tournament.final_games_count,
    players: [] // tu możesz dodać dodatkową logikę dla graczy, jeśli potrzeba
  };

  console.log("GET - Wysyłamy odpowiedź:", responseData);
  return NextResponse.json(responseData);
}

// PATCH – aktualizuje dane turnieju oraz rekordy rund
// Jeśli zmniejszysz liczbę rund, usuwa rekordy o round_number większym niż total_rounds
export async function PATCH(req, context) {
  const params = await Promise.resolve(context.params);
  const tournamentId = params.tournamentId;
  if (!tournamentId) {
    console.error("PATCH - Brak ID turnieju w parametrach:", params);
    return NextResponse.json({ error: "Brak ID turnieju." }, { status: 400 });
  }
  console.log("PATCH - Tournament ID:", tournamentId);

  try {
    const updateData = await req.json();
    console.log("PATCH - Dane otrzymane z frontendu do aktualizacji:", updateData);

    // Podstawowa walidacja
    if (!updateData.name || !updateData.city || !updateData.start_date) {
      console.error("PATCH - Nieprawidłowe dane turnieju:", updateData);
      return NextResponse.json({ error: "Nieprawidłowe dane turnieju." }, { status: 400 });
    }

    // Aktualizacja danych turnieju – przygotowujemy zapytanie, ustawiamy warunek i dodajemy .select() żeby otrzymać zaktualizowany rekord
    let updateQuery = supabase.from("tournaments").update({
      name: updateData.name,
      ranga: updateData.ranga,
      city: updateData.city,
      region: updateData.region,
      start_date: updateData.start_date,
      max_players: updateData.max_players,
      total_rounds: updateData.total_rounds,
      has_final: updateData.has_final,
      final_games_count: updateData.final_games_count,
    });
    updateQuery = updateQuery.eq("id", tournamentId).select();
    const { data: updatedTournament, error: updateError } = await updateQuery.maybeSingle();

    console.log("PATCH - Wynik aktualizacji turnieju:", { updatedTournament, updateError });
    if (updateError || !updatedTournament) {
      console.error("PATCH - Błąd aktualizacji turnieju:", updateError);
      return NextResponse.json({ error: "Nie udało się zaktualizować turnieju." }, { status: 500 });
    }

    // Jeśli zmniejszysz liczbę rund, usuń rekordy o round_number > total_rounds
    const { error: deleteError } = await supabase
      .from("tournament_rounds")
      .delete()
      .eq("tournament_id", tournamentId)
      .gt("round_number", updatedTournament.total_rounds);
    if (deleteError) {
      console.error("PATCH - Błąd przy usuwaniu nadmiarowych rund:", deleteError);
      return NextResponse.json({ error: "Błąd przy usuwaniu nadmiarowych rund." }, { status: 500 });
    }

    // Upsert rekordów rund. Modyfikujemy mapowanie – jeśli round.name === "", ustawiamy null.
    if (Array.isArray(updateData.rounds)) {
      const roundsToUpsert = updateData.rounds.map((round) => ({
        tournament_id: tournamentId,
        round_number: round.round_number,
        games_in_round: round.games_in_round,
        name: round.name === "" ? null : round.name,
      }));
      const { error: roundsUpsertError } = await supabase
        .from("tournament_rounds")
        .upsert(roundsToUpsert, { onConflict: "tournament_id, round_number" });
      if (roundsUpsertError) {
        console.error("PATCH - Błąd aktualizacji rund:", roundsUpsertError);
        return NextResponse.json({ error: "Błąd aktualizacji rund." }, { status: 500 });
      }
    }

    // Pobierz zaktualizowane rekordy rund
    const { data: roundsData, error: roundsError } = await supabase
      .from("tournament_rounds")
      .select("round_number, games_in_round, name")
      .eq("tournament_id", tournamentId)
      .order("round_number", { ascending: true });
    if (roundsError) {
      console.error("PATCH - Błąd przy pobieraniu rund:", roundsError);
      return NextResponse.json({ error: "Błąd pobierania rund." }, { status: 500 });
    }

    const responseData = {
      tournament: updatedTournament,
      rounds: roundsData || [],
      has_final: updatedTournament.has_final,
      final_games_count: updatedTournament.final_games_count,
    };

    console.log("PATCH - Wysyłamy odpowiedź z PATCH:", responseData);
    return NextResponse.json(responseData);
  } catch (err) {
    console.error("PATCH - Błąd przetwarzania żądania PATCH:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
