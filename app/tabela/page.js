// app/tabela/page.js
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Editable field for Region
function EditableRegion({ region, setRegion }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div>
      <label className="block font-medium">Region:</label>
      {isEditing ? (
        <select
          value={region || ""}
          onChange={e => {
            console.log("[EditableRegion] region →", e.target.value);
            setRegion(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="w-full border p-2 rounded bg-[#000080] text-white"
        >
          <option value="">-- Wybierz region --</option>
          <option value="Dolnośląskie">Dolnośląskie</option>
          <option value="Kujawsko-Pomorskie">Kujawsko-Pomorskie</option>
          <option value="Lubelskie">Lubelskie</option>
          <option value="Lubuskie">Lubuskie</option>
          <option value="Łódzkie">Łódzkie</option>
          <option value="Małopolskie">Małopolskie</option>
          <option value="Mazowieckie">Mazowieckie</option>
          <option value="Opolskie">Opolskie</option>
          <option value="Podkarpackie">Podkarpackie</option>
          <option value="Podlaskie">Podlaskie</option>
          <option value="Pomorskie">Pomorskie</option>
          <option value="Śląskie">Śląskie</option>
          <option value="Świętokrzyskie">Świętokrzyskie</option>
          <option value="Warmińsko-Mazurskie">Warmińsko-Mazurskie</option>
          <option value="Wielkopolskie">Wielkopolskie</option>
          <option value="Zachodniopomorskie">Zachodniopomorskie</option>
        </select>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full p-2 border rounded cursor-pointer"
        >
          {region || <span className="text-gray-500">-- Brak regionu --</span>}
        </div>
      )}
    </div>
  );
}

// Editable field for Ranga
function EditableRanga({ ranga, setRanga }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div>
      <label className="block font-medium">Ranga:</label>
      {isEditing ? (
        <select
          value={ranga || ""}
          onChange={e => {
            console.log("[EditableRanga] ranga →", e.target.value);
            setRanga(e.target.value);
          }}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="w-full border p-2 rounded bg-[#000080] text-white"
        >
          <option value="">-- Wybierz rangę --</option>
          <option value="Zwykły">Zwykły</option>
          <option value="Liga">Liga</option>
          <option value="Mistrzostwa">Mistrzostwa</option>
        </select>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full p-2 border rounded cursor-pointer"
        >
          {ranga || <span className="text-gray-500">-- Brak rangi --</span>}
        </div>
      )}
    </div>
  );
}

export default function TabelaPage() {
  // only admins can edit
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setIsAuthorized(false);
      const { data: userInfo } = await supabase
        .from("users")
        .select("ranga")
        .eq("id", session.user.id)
        .single();
      setIsAuthorized(userInfo?.ranga === "admin");
    };
    checkAdmin();
  }, []);

  // data states
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // form fields
  const [name, setName] = useState("");
  const [ranga, setRanga] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [hasFinal, setHasFinal] = useState(false);
  const [finalGamesCount, setFinalGamesCount] = useState(0);

  // 1) fetch tournaments list
  useEffect(() => {
    fetch("/api/tabela")
      .then(async res => {
        if (!res.ok) throw new Error(await res.text() || res.statusText);
        return res.json();
      })
      .then(json => setTournaments(json.tournaments))
      .catch(err => setError("Błąd pobierania turniejów: " + err.message));
  }, []);

  // 2) fetch details when selection changes
  useEffect(() => {
    if (!selectedTournamentId) return setTournamentInfo(null);

    fetch(`/api/tabela/${selectedTournamentId}`)
      .then(async res => {
        if (!res.ok) throw new Error(await res.text() || res.statusText);
        return res.json();
      })
      .then(json => {
        const t = json.tournament;
        setTournamentInfo(t);
        setName(t.name);
        setRanga(t.ranga);
        setCity(t.city);
        setRegion(t.region);
        setStartDate(t.start_date);
        setMaxPlayers(t.max_players);
        setTotalRounds(t.total_rounds);
        setHasFinal(t.has_final);
        setFinalGamesCount(t.final_games_count);
        setRounds(
          json.rounds.length
            ? json.rounds
            : Array.from({ length: t.total_rounds }, (_, i) => ({
                round_number: i + 1,
                games_in_round: 0,
                name: ""
              }))
        );
      })
      .catch(err => setError("Błąd pobierania szczegółów: " + err.message));
  }, [selectedTournamentId]);

  // 3) sync rounds array with totalRounds
  useEffect(() => {
    if (totalRounds > rounds.length) {
      setRounds(rs => [
        ...rs,
        ...Array.from({ length: totalRounds - rs.length }, (_, i) => ({
          round_number: rs.length + i + 1,
          games_in_round: 0,
          name: ""
        }))
      ]);
    } else if (totalRounds < rounds.length) {
      setRounds(rs => rs.slice(0, totalRounds));
    }
  }, [totalRounds]);

  // handle single-round changes
  const handleRoundChange = (index, field, value) => {
    setRounds(rs =>
      rs.map((r, idx) =>
        idx === index
          ? { ...r, [field]: field === "games_in_round" ? Number(value) : value }
          : r
      )
    );
  };

  // 4) submit PATCH
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      name,
      ranga,
      city,
      region,
      start_date: startDate,
      max_players: maxPlayers,
      total_rounds: totalRounds,
      rounds,
      has_final: hasFinal,
      final_games_count: finalGamesCount
    };
    console.log("[Submit] payload:", payload);

    try {
      const res = await fetch(`/api/tabela/${selectedTournamentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // capture JSON body
      const responseData = await res.json();
      console.log("[Submit] API response:", responseData);

      if (res.ok) {
        setMessage("Zaktualizowano pomyślnie");
        setTournamentInfo(responseData.tournament);

        // **update dropdown instantly**
        setTournaments(prev =>
          prev.map(t =>
            t.id === responseData.tournament.id
              ? { ...t, name: responseData.tournament.name }
              : t
          )
        );
      } else {
        console.error("[Submit] API error:", responseData.error);
        setError(responseData.error || "Błąd podczas aktualizacji");
      }
    } catch (err) {
      console.error("[Submit] network error:", err);
      setError("Błąd sieci: " + err.message);
    }
  };

  // if not admin → no access
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center">Brak Dostępu</h1>
        <p className="text-center">Tylko administrator może edytować.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Edycja Turnieju</h1>
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {/* Turniej selector */}
      <div className="p-4 rounded">
        <label className="mr-2 font-medium">Wybierz turniej:</label>
        <select
          value={selectedTournamentId}
          onChange={e => setSelectedTournamentId(e.target.value)}
          className="border p-2 rounded bg-[#000080] text-white"
        >
          <option value="">-- wybierz --</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Edit form */}
      {tournamentInfo && (
        <form onSubmit={handleSubmit} className="p-6 border rounded shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block font-medium">Nazwa:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Ranga */}
            <div>
              <EditableRanga ranga={ranga} setRanga={setRanga} />
            </div>

            {/* City */}
            <div>
              <label className="block font-medium">Miasto:</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Region */}
            <div>
              <EditableRegion region={region} setRegion={setRegion} />
            </div>

            {/* Date */}
            <div>
              <label className="block font-medium">Data:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Max players */}
            <div>
              <label className="block font-medium">Maks. graczy:</label>
              <input
                type="number"
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                min="0"
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Total rounds */}
            <div>
              <label className="block font-medium">Liczba rund:</label>
              <input
                type="number"
                value={totalRounds}
                onChange={e => setTotalRounds(Number(e.target.value))}
                min="1"
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* Rounds details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xl font-semibold">Szczegóły rund</h3>
            {rounds.map((r, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="w-28">Runda {r.round_number}:</span>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <label className="font-medium">Partie:</label>
                  <input
                    type="number"
                    value={r.games_in_round || ""}
                    onChange={e => handleRoundChange(i, "games_in_round", e.target.value)}
                    min="0"
                    className="w-20 border p-2 rounded"
                  />
                  <label className="font-medium">Nazwa rundy:</label>
                  <input
                    type="text"
                    value={r.name || ""}
                    onChange={e => handleRoundChange(i, "name", e.target.value)}
                    className="border p-2 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Final configuration */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-xl font-semibold">Finał</h3>
            <div className="flex items-center gap-4">
              <label className="block font-medium">Czy będzie finał?</label>
              <input
                type="checkbox"
                checked={hasFinal}
                onChange={e => setHasFinal(e.target.checked)}
                className="w-6 h-6"
              />
            </div>
            {hasFinal && (
              <div>
                <label className="block font-medium">Ile partii w finale?</label>
                <input
                  type="number"
                  value={finalGamesCount || ""}
                  onChange={e => setFinalGamesCount(Number(e.target.value))}
                  min="0"
                  className="w-full border p-2 rounded"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition"
          >
            Zaktualizuj Turniej
          </button>
        </form>
      )}
    </div>
  );
}
