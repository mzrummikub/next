"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WOJEWODZTWA = [
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
  "zachodniopomorskie",
];

export default function AddOrEditGraczPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // jeśli parametr id istnieje, mamy tryb edycji

  // Stany formularza
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [miasto, setMiasto] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [rokUrodzenia, setRokUrodzenia] = useState("");
  const [ranking, setRanking] = useState(1200);
  const [message, setMessage] = useState("");

  // Jeśli mamy tryb edycji, pobierz rekord
  useEffect(() => {
    async function loadGracz() {
      if (!id) return;
      const { data, error } = await supabase
        .from("gracz")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setMessage("Błąd ładowania rekordu: " + error.message);
      } else if (data) {
        setUid(data.uid || "");
        setEmail(data.email || "");
        setImie(data.imie || "");
        setNazwisko(data.nazwisko || "");
        setMiasto(data.miasto || "");
        setWojewodztwo(data.wojewodztwo || "");
        setRokUrodzenia(data.rok_urodzenia || "");
        setRanking(data.ranking || 1200);
      }
    }
    loadGracz();
  }, [id]);

  // Funkcja obsługująca zapis (dodanie lub edycja)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Sprawdź wymagane pola
    if (!imie || !nazwisko) {
      setMessage("Imię i nazwisko są obowiązkowe!");
      return;
    }

    // Przygotuj obiekt danych
    const graczData = {
      uid: uid || null,
      email: email || null,
      imie,
      nazwisko,
      miasto: miasto || null,
      wojewodztwo: wojewodztwo || null,
      rok_urodzenia: rokUrodzenia ? parseInt(rokUrodzenia) : null,
      ranking: ranking ? parseInt(ranking) : 1200,
    };

    let result;
    if (id) {
      // Aktualizacja rekordu
      result = await supabase
        .from("gracz")
        .update(graczData)
        .eq("id", id)
        .single();
    } else {
      // Dodawanie nowego rekordu
      result = await supabase.from("gracz").insert(graczData).single();
    }

    if (result.error) {
      setMessage("Błąd zapisu: " + result.error.message);
    } else {
      setMessage(id ? "Rekord zaktualizowany!" : "Rekord dodany!");
      // Opcjonalnie przekieruj lub zresetuj formularz
      if (!id) {
        setUid("");
        setEmail("");
        setImie("");
        setNazwisko("");
        setMiasto("");
        setWojewodztwo("");
        setRokUrodzenia("");
        setRanking(1200);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edytuj gracza" : "Dodaj nowego gracza"}
      </h1>
      {message && <p className="mb-4 text-center text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">UID (opcjonalnie):</label>
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Może być puste, jeśli rekord jest nowy"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email (opcjonalnie):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="np. gracz@example.com"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Imię <span className="text-red-500">*</span>:
          </label>
          <input
            type="text"
            value={imie}
            onChange={(e) => setImie(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Nazwisko <span className="text-red-500">*</span>:
          </label>
          <input
            type="text"
            value={nazwisko}
            onChange={(e) => setNazwisko(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Miasto:</label>
          <input
            type="text"
            value={miasto}
            onChange={(e) => setMiasto(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Województwo:</label>
          <select
            value={wojewodztwo}
            onChange={(e) => setWojewodztwo(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">-- wybierz województwo --</option>
            {WOJEWODZTWA.map((woj) => (
              <option key={woj} value={woj}>
                {woj}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Rok urodzenia:</label>
          <input
            type="number"
            value={rokUrodzenia}
            onChange={(e) => setRokUrodzenia(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Ranking:</label>
          <input
            type="number"
            value={ranking}
            onChange={(e) => setRanking(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Domyślnie 1200"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? "Zapisz zmiany" : "Dodaj gracza"}
        </button>
      </form>
    </div>
  );
}
