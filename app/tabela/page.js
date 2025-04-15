"use client";

import { useEffect, useState } from "react";

export default function TabelaPage() {
  // Lista turniejów pobranych z API
  const [tournaments, setTournaments] = useState([]);
  // Wybrany turniej (identyfikator)
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  // Szczegółowe dane turnieju pobrane z backendu
  const [tournamentInfo, setTournamentInfo] = useState(null);
  // Komunikaty o błędach i sukcesie
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Pola turnieju (zgodne z tabelą tournaments)
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  // Dane rund: każdy obiekt: { round_number, games_in_round, name }
  const [rounds, setRounds] = useState([]);

  // Dane dotyczące finału: has_final i final_games_count
  const [hasFinal, setHasFinal] = useState(false);
  const [finalGamesCount, setFinalGamesCount] = useState(0);

  // ----------------------------
  // Pobieranie listy turniejów (GET /api/tabela)
  // ----------------------------
  useEffect(() => {
    fetch("/api/tabela")
      .then((res) => res.json())
      .then((json) => {
        console.log("Lista turniejów:", json);
        if (json.error) {
          setError(json.error);
        } else {
          setTournaments(json.tournaments);
        }
      })
      .catch((err) => {
        setError("Błąd pobierania turniejów: " + err.message);
        console.error("Błąd pobierania turniejów:", err);
      });
  }, []);

  // ----------------------------
  // Pobieranie szczegółów wybranego turnieju (GET /api/tabela/[tournamentId])
  // ----------------------------
  useEffect(() => {
    if (!selectedTournamentId) {
      setTournamentInfo(null);
      return;
    }
    fetch(`/api/tabela/${selectedTournamentId}`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Dane turnieju z API:", json);
        if (json.error) {
          setError(json.error);
          setTournamentInfo(null);
        } else {
          const t = json.tournament;
          setTournamentInfo(t);
          setName(t.name);
          setType(t.type);
          setCity(t.city);
          setRegion(t.region);
          setStartDate(t.start_date);
          setMaxPlayers(t.max_players);
          setTotalRounds(t.total_rounds);
          // Pobierz dane rund – jeśli API zwraca rekordy, użyj ich; inaczej inicjuj domyślną tablicę
          if (json.rounds && Array.isArray(json.rounds) && json.rounds.length > 0) {
            setRounds(json.rounds);
          } else {
            const initialRounds = [];
            for (let i = 1; i <= t.total_rounds; i++) {
              initialRounds.push({ round_number: i, games_in_round: 0, name: "" });
            }
            setRounds(initialRounds);
          }
          setHasFinal(t.has_final || false);
          setFinalGamesCount(t.final_games_count || 0);
        }
      })
      .catch((err) => {
        setError("Błąd pobierania szczegółów turnieju: " + err.message);
        console.error("Błąd pobierania szczegółów turnieju:", err);
      });
  }, [selectedTournamentId]);

  // ----------------------------
  // Aktualizacja tablicy rund przy zmianie liczby rund (totalRounds)
  // ----------------------------
  useEffect(() => {
    if (totalRounds > rounds.length) {
      const updatedRounds = [...rounds];
      for (let i = rounds.length + 1; i <= totalRounds; i++) {
        updatedRounds.push({ round_number: i, games_in_round: 0, name: "" });
      }
      setRounds(updatedRounds);
    } else if (totalRounds < rounds.length) {
      setRounds(rounds.slice(0, totalRounds));
    }
    console.log("Zaktualizowana tablica rund:", rounds);
  }, [totalRounds]);

  // ----------------------------
  // Obsługa zmiany danych dla konkretnej rundy
  // ----------------------------
  const handleRoundChange = (index, field, value) => {
    const updatedRounds = rounds.map((r, idx) =>
      idx === index
        ? { ...r, [field]: field === "games_in_round" ? Number(value) : value }
        : r
    );
    setRounds(updatedRounds);
    console.log(`Aktualizacja rundy nr ${index + 1}, pole ${field}:`, value);
  };

  // ----------------------------
  // Wysyłka formularza aktualizacji turnieju (PATCH /api/tabela/[tournamentId])
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      name,
      type,
      city,
      region,
      start_date: startDate,
      max_players: maxPlayers,
      total_rounds: totalRounds,
      rounds, // Tablica obiektów: { round_number, games_in_round, name }
      has_final: hasFinal,
      final_games_count: finalGamesCount,
    };
    console.log("Payload do wysyłki PATCH:", payload);

    try {
      const res = await fetch(`/api/tabela/${selectedTournamentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Odpowiedź po PATCH:", data);
      if (res.ok) {
        setMessage("Turniej zaktualizowany pomyślnie.");
        setTournamentInfo(data.tournament);
        if (data.rounds) setRounds(data.rounds);
        setHasFinal(data.has_final);
        setFinalGamesCount(data.final_games_count);
      } else {
        setError(data.error || "Błąd podczas aktualizacji turnieju.");
        console.error("Błąd aktualizacji turnieju (frontend):", data.error);
      }
    } catch (err) {
      setError("Błąd połączenia: " + err.message);
      console.error("Błąd połączenia:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Edycja Turnieju</h1>
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {/* Sekcja wyboru turnieju */}
      <div className="bg-blue-500 text-black p-4 rounded">
        <label className="mr-2 font-medium">Wybierz turniej:</label>
        <select
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">-- wybierz --</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Formularz edycji danych turnieju */}
      {tournamentInfo && (
        <div className="p-6 border rounded shadow-md space-y-4">
          <h2 className="text-2xl font-bold">Edytuj dane turnieju</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium">Nazwa:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Typ:</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Miasto:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Region:</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Data:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Maks. graczy:</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  min="0"
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Liczba rund:</label>
                <input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  min="1"
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>

            {/* Sekcja szczegółów rund */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xl font-semibold">Szczegóły rund</h3>
              {rounds.map((r, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="w-28">Runda {r.round_number}:</span>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <label className="font-medium">Partie:</label>
                    <input
                      type="number"
                      value={r.games_in_round || ""}
                      onChange={(e) =>
                        handleRoundChange(index, "games_in_round", e.target.value)
                      }
                      min="0"
                      className="w-20 border p-2 rounded"
                    />
                    <label className="font-medium">Nazwa rundy:</label>
                    <input
                      type="text"
                      value={r.name || ""}
                      onChange={(e) =>
                        handleRoundChange(index, "name", e.target.value)
                      }
                      className="border p-2 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sekcja konfiguracji finału */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xl font-semibold">Finał</h3>
              <div className="flex items-center gap-4">
                <label className="block font-medium">Czy będzie finał?</label>
                <input
                  type="checkbox"
                  checked={hasFinal}
                  onChange={(e) => setHasFinal(e.target.checked)}
                  className="w-6 h-6"
                />
              </div>
              {hasFinal && (
                <div>
                  <label className="block font-medium">Ile partii w finale?</label>
                  <input
                    type="number"
                    value={finalGamesCount || ""}
                    onChange={(e) => setFinalGamesCount(Number(e.target.value))}
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

          {/* Podsumowanie – tabela wyświetlająca dane rund i finału */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Podsumowanie:</h3>
            <table className="min-w-full border-collapse border border-gray-400">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Runda</th>
                  <th className="border border-gray-300 px-4 py-2">Partie</th>
                  <th className="border border-gray-300 px-4 py-2">Nazwa rundy</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">Runda {r.round_number}</td>
                    <td className="border border-gray-300 px-4 py-2">{r.games_in_round}</td>
                    <td className="border border-gray-300 px-4 py-2">{r.name}</td>
                  </tr>
                ))}
                {hasFinal && (
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-bold">Finał</td>
                    <td className="border border-gray-300 px-4 py-2">{finalGamesCount}</td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
