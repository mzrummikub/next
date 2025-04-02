"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PlayerRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRanking() {
      try {
        // Pobieramy graczy z tabeli "gracz" i sortujemy po kolumnie "ranking" malejąco.
        const { data, error } = await supabase
          .from("gracz")
          .select("id, imie, nazwisko, ranking")
          .order("ranking", { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setRanking(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie rankingu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded">
        <p>Błąd: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ranking Graczy</h1>
      {ranking.length === 0 ? (
        <p>Brak danych do wyświetlenia rankingu.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-center">Pozycja</th>
              <th className="border p-2">Imię i Nazwisko</th>
              <th className="border p-2 text-center">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, index) => (
              <tr key={player.id}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">
                  {player.imie} {player.nazwisko}
                </td>
                <td className="border p-2 text-center">{player.ranking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
