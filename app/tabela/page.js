"use client";

import { useEffect, useState } from "react";

export default function TabelaTurniejuPage() {
  // Stany przechowujące dane turniejów, graczy, wyników oraz komunikaty błędów.
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [tournamentInfo, setTournamentInfo] = useState(null);

  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const [totalRounds, setTotalRounds] = useState(0);
  const [points, setPoints] = useState({});
  const [error, setError] = useState("");

  const [showTable, setShowTable] = useState(false);

  // Efekt pobierający listę turniejów z API przy pierwszym renderze komponentu.
  useEffect(() => {
    fetch("/api/tabela")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setTournaments(json.tournaments);
      });
  }, []);

  // Efekt wywoływany przy zmianie wybranego turnieju – pobiera szczegóły turnieju.
  useEffect(() => {
    if (!selectedTournamentId) return;
    fetch(`/api/tabela/${selectedTournamentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else {
          setTournamentInfo(json.tournament);
          setSelectedPlayers([]);
          setPoints({});
          setTotalRounds(json.totalRounds);
          setShowTable(false);
        }
      });
  }, [selectedTournamentId]);

  // Efekt pobierający listę graczy z API przy pierwszym renderze komponentu.
  useEffect(() => {
    fetch("/api/gracze")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setAllPlayers(json.players);
      });
  }, []);

  // Funkcja obsługująca zaznaczanie i odznaczanie graczy (checkbox).
  const handleCheckboxChange = (player) => {
    setSelectedPlayers((prev) => {
      const already = prev.find((p) => p.id === player.id);
      if (already) {
        return prev.filter((p) => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  // Funkcja aktualizująca punkty danego gracza dla konkretnej rundy i typu punktacji.
  const handlePointChange = (playerId, round, type, value) => {
    setPoints((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [round]: {
          ...(prev[playerId]?.[round] || {}),
          [type]: Number(value),
        },
      },
    }));
  };

  // Funkcja obliczająca sumaryczną wartość punktów dla danego gracza i typu punktacji.
  const getTotal = (playerId, type) => {
    let sum = 0;
    for (let r = 1; r <= totalRounds; r++) {
      const value = points[playerId]?.[r]?.[type] || 0;
      sum += value;
    }
    return sum;
  };

  return (
    <div className="max-w-full p-6 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6">Tabela turnieju</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Sekcja wyboru turnieju – opakowana w div z niebieskim tłem i czarną czcionką */}
      <div className="mb-6 text-blue-400 p-4 rounded">
        <label className="mr-2 font-medium">Wybierz turniej:</label>
        <select
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="bg-green">-- wybierz --</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Szczegóły turnieju */}
      {tournamentInfo && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Szczegóły turnieju</h2>
          <ul className="text-sm space-y-1">
            <li><strong>Nazwa:</strong> {tournamentInfo.name}</li>
            <li><strong>Miasto:</strong> {tournamentInfo.city}</li>
            <li><strong>Województwo:</strong> {tournamentInfo.region}</li>
            <li><strong>Data:</strong> {tournamentInfo.start_date}</li>
            <li><strong>Maks. graczy:</strong> {tournamentInfo.max_players}</li>
            <li><strong>Liczba rund:</strong> {tournamentInfo.total_rounds}</li>
          </ul>
        </div>
      )}

      {/* Lista graczy z checkboxami */}
      {selectedTournamentId && (
        <div className="mb-6 border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Wybierz uczestników:</h2>
          <ul className="space-y-1 text-sm">
            {allPlayers.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPlayers.some((sp) => sp.id === p.id)}
                  onChange={() => handleCheckboxChange(p)}
                />
                {p.imie} {p.nazwisko}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowTable(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Zapisz uczestników
          </button>
        </div>
      )}

      {/* Tabela rund – wyświetlana po zaznaczeniu uczestników oraz przy określonej liczbie rund */}
      {showTable && selectedPlayers.length > 0 && totalRounds > 0 && (
        <table className="border-collapse border w-full text-sm">
          <thead>
            <tr>
              <th className="border px-4 py-2">Gracz</th>
              {[...Array(totalRounds)].map((_, i) => (
                <th key={i} colSpan={2} className="border px-2 py-1 text-center">
                  Runda {i + 1}
                </th>
              ))}
              <th className="border px-4 py-2">Suma dużych</th>
              <th className="border px-4 py-2">Suma małych</th>
            </tr>
            <tr>
              <th></th>
              {[...Array(totalRounds)].flatMap((_, i) => [
                <th key={`duze-${i}`} className="border px-2 py-1 text-center">Duże</th>,
                <th key={`male-${i}`} className="border px-2 py-1 text-center">Małe</th>,
              ])}
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {selectedPlayers.map((player) => (
              <tr key={player.id}>
                <td className="border px-4 py-2 font-medium">
                  {player.imie} {player.nazwisko}
                </td>
                {[...Array(totalRounds)].flatMap((_, r) => [
                  <td key={`duze-${player.id}-${r}`} className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full p-1 border rounded"
                      value={points[player.id]?.[r + 1]?.duze || ""}
                      onChange={(e) =>
                        handlePointChange(player.id, r + 1, "duze", e.target.value)
                      }
                    />
                  </td>,
                  <td key={`male-${player.id}-${r}`} className="border px-2 py-1">
                    <input
                      type="number"
                      className="w-full p-1 border rounded"
                      value={points[player.id]?.[r + 1]?.male || ""}
                      onChange={(e) =>
                        handlePointChange(player.id, r + 1, "male", e.target.value)
                      }
                    />
                  </td>,
                ])}
                <td className="border px-4 py-2 font-semibold text-center">
                  {getTotal(player.id, "duze")}
                </td>
                <td className="border px-4 py-2 font-semibold text-center">
                  {getTotal(player.id, "male")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
