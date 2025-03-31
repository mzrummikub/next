"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 1) Konfiguracja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2) Lista województw (powinna odpowiadać wartościom w typie ENUM)
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

export default function AddOrEditGraczPage() {
  // 3) Stan sesji i uprawnień
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 4) Pola formularza
  const [id, setId] = useState(null); // odczytane z parametru ?id=..., jeśli edycja
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [miasto, setMiasto] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [rokUrodzenia, setRokUrodzenia] = useState("");
  const [ranking, setRanking] = useState(1200);

  const [message, setMessage] = useState("");

  // 5) Obsługa nawigacji i parametrów URL
  const router = useRouter();
  const searchParams = useSearchParams();

  // 6) Sprawdzamy, czy mamy ?id=... (edycja) czy nie (dodawanie)
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setId(idParam);
    }
  }, [searchParams]);

  // 7) Pobierz sesję i sprawdź, czy użytkownik jest adminem
  useEffect(() => {
    async function getSessionAndCheckAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSession(session);

      // 7a) Sprawdzamy w tabeli users, czy ranga = 'admin'
      const { data, error } = await supabase
        .from("users")
        .select("ranga")
        .eq("id", session.user.id)
        .single();
      if (error || !data) {
        setMessage("Błąd sprawdzania rangi lub brak dostępu.");
        return;
      }
      if (data.ranga === "admin") {
        setIsAdmin(true);
      } else {
        setMessage("Brak uprawnień (nie jesteś adminem).");
      }
    }
    getSessionAndCheckAdmin();
  }, [router]);

  // 8) Jeśli mamy `id`, ładujemy dane gracza (edycja)
  useEffect(() => {
    async function loadGracz() {
      if (!id) return; // jeśli nie mamy parametru, to nie ładujemy
      // Pobierz rekord
      const { data, error } = await supabase
        .from("gracz")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setMessage("Błąd ładowania rekordu: " + error.message);
        return;
      }
      if (data) {
        // Wypełniamy formularz danymi z bazy
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
    if (isAdmin) {
      loadGracz();
    }
  }, [id, isAdmin]);

  // 9) Obsługa SUBMIT (dodawanie lub edycja)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Sprawdzamy, czy wymagane pola (imie, nazwisko) są wypełnione
    if (!imie || !nazwisko) {
      setMessage("Imię i nazwisko są wymagane!");
      return;
    }

    // Tworzymy obiekt z danymi
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
      // 9a) Mamy id -> edycja
      result = await supabase
        .from("gracz")
        .update(graczData)
        .eq("id", id)
        .single();
    } else {
      // 9b) Nie mamy id -> dodawanie
      result = await supabase.from("gracz").insert(graczData).single();
    }

    if (result.error) {
      setMessage("Błąd zapisu: " + result.error.message);
    } else {
      setMessage(id ? "Edytowano rekord!" : "Dodano nowy rekord!");
      // Przekierowanie? Reset formularza?
      // router.push("/panel"); // np. powrót do panelu
    }
  };

  // 10) Widok
  // Jeśli nie ma sesji lub user nie jest adminem -> komunikat
  if (!session || !isAdmin) {
    return (
      <div className="p-4">
        <p>{message || "Trwa sprawdzanie uprawnień..."}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edytuj gracza" : "Dodaj nowego gracza"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">UID (powiązanie z auth.users):</label>
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="np. UUID użytkownika (może być puste)"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Opcjonalnie, może być puste"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            Imię <span className="text-red-500">*</span>
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
            Nazwisko <span className="text-red-500">*</span>
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
          <label className="block font-semibold mb-1">Ranking (domyślnie 1200):</label>
          <input
            type="number"
            value={ranking}
            onChange={(e) => setRanking(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? "Zapisz zmiany" : "Dodaj gracza"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
}
