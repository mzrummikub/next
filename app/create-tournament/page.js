"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminCreateTournament() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Stany formularza turnieju
  const [nazwa, setNazwa] = useState("");
  const [ranga, setRanga] = useState("zwykły");
  const [miasto, setMiasto] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [limitMiejsc, setLimitMiejsc] = useState(0);
  const [dataTurnieju, setDataTurnieju] = useState("");

  const wojewodztwa = [
    "dolnośląskie",
    "kujawsko-pomorskie",
    "lubelskie",
    "lubuskie",
    "łódzkie",
    "małopolskie",
    "mazowieckie",
    "opolskie",
    "podkarpackie",
    "podlaskie",
    "pomorskie",
    "śląskie",
    "świętokrzyskie",
    "warmińsko-mazurskie",
    "wielkopolskie",
    "zachodniopomorskie"
  ];

  // Sprawdź sesję i pobierz dane użytkownika z tabeli "users"
  useEffect(() => {
    async function getSessionAndUser() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();
        if (error) {
          setMessage("Błąd pobierania danych użytkownika: " + error.message);
        } else {
          setUserData(data);
        }
      }
      setLoading(false);
    }
    getSessionAndUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  // Jeśli użytkownik nie jest adminem, przekieruj lub pokaż komunikat
  if (!userData || userData.ranga !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Brak uprawnień. Tylko administratorzy mogą tworzyć turnieje.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const body = {
      nazwa,
      ranga,
      miasto,
      wojewodztwo,
      limit_miejsc: Number(limitMiejsc),
      data_turnieju: dataTurnieju || null,
    };

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) {
        setMessage("Błąd: " + json.error);
      } else {
        setMessage("Turniej utworzony pomyślnie!");
        // Opcjonalnie przekieruj do strony turniejów
        // router.push("/turnieje");
      }
    } catch (err) {
      setMessage("Błąd: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Utwórz Turniej (Panel Admina)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nazwa turnieju:</label>
          <input
            type="text"
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Ranga turnieju:</label>
          <select
            value={ranga}
            onChange={(e) => setRanga(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="mistrzowska">Mistrzowska</option>
            <option value="liga">Liga</option>
            <option value="zwykły">Zwykły</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Miasto:</label>
          <input
            type="text"
            value={miasto}
            onChange={(e) => setMiasto(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Województwo:</label>
          <select
            value={wojewodztwo}
            onChange={(e) => setWojewodztwo(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Wybierz województwo</option>
            {wojewodztwa.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Limit miejsc:</label>
          <input
            type="number"
            value={limitMiejsc}
            onChange={(e) => setLimitMiejsc(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Data turnieju:</label>
          <input
            type="date"
            value={dataTurnieju}
            onChange={(e) => setDataTurnieju(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Utwórz Turniej
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
