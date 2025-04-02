"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTournamentPage() {
  const router = useRouter();

  // Stany dla kolumn tabeli "turniej"
  const [nazwa, setNazwa] = useState("");
  const [ranga, setRanga] = useState("zwykły"); // kolumna ranga (enum: mistrzowska, liga, zwykły)
  const [miasto, setMiasto] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [dataTurnieju, setDataTurnieju] = useState("");
  const [limitMiejsc, setLimitMiejsc] = useState(0);
  const [finalTurniej, setFinalTurniej] = useState(false);     // kolumna final (bool)
  const [isKolejka, setIsKolejka] = useState(false);           // kolumna is_kolejka (bool)
  const [iloscKolejek, setIloscKolejek] = useState(0);         // kolumna ilosc_kolejek (int)

  // Stany dla tabeli "runda"
  // Przechowujemy tablicę rund: { runda_nr, liczba_partii, final_round (bool) }
  const [rundy, setRundy] = useState([]);

  // Lista województw
  const wojewodztwaLista = [
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

  // Funkcja do dodawania nowej rundy
  const handleAddRound = () => {
    setRundy((prev) => [
      ...prev,
      {
        runda_nr: prev.length + 1,
        liczba_partii: 1,
        final_round: false,
      },
    ]);
  };

  // Obsługa wysyłki formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Przygotowujemy obiekt z danymi do wysłania
    const body = {
      // Kolumny z tabeli "turniej"
      nazwa,
      ranga,
      miasto,
      wojewodztwo,
      data_turnieju: dataTurnieju || null,
      limit_miejsc: Number(limitMiejsc),
      final: finalTurniej,
      is_kolejka: isKolejka,
      ilosc_kolejek: isKolejka ? Number(iloscKolejek) : 0,

      // Dane do tabeli "runda"
      rundy: rundy.map((r) => ({
        runda_nr: r.runda_nr,
        liczba_partii: Number(r.liczba_partii),
        final_round: r.final_round,
      })),
    };

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) {
        alert("Błąd: " + json.error);
      } else {
        alert("Turniej utworzony pomyślnie!");
        router.push("/admin/tournaments"); // przekieruj do listy turniejów
      }
    } catch (err) {
      alert("Błąd: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Utwórz Turniej</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dane ogólne */}
        <div>
          <label className="block font-semibold mb-1">Nazwa:</label>
          <input
            type="text"
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Ranga:</label>
          <select
            value={ranga}
            onChange={(e) => setRanga(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="mistrzowska">mistrzowska</option>
            <option value="liga">liga</option>
            <option value="zwykły">zwykły</option>
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
            {wojewodztwaLista.map((w) => (
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

        {/* Flaga final (czy turniej ma rundę finałową) */}
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={finalTurniej}
              onChange={(e) => setFinalTurniej(e.target.checked)}
              className="mr-2"
            />
            Turniej posiada rundę finałową
          </label>
        </div>

        {/* Flaga is_kolejka + ilosc_kolejek */}
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isKolejka}
              onChange={(e) => setIsKolejka(e.target.checked)}
              className="mr-2"
            />
            Turniej rozgrywany w formacie ligi (kolejki)
          </label>
        </div>
        {isKolejka && (
          <div>
            <label className="block font-semibold mb-1">Ilość kolejek:</label>
            <input
              type="number"
              value={iloscKolejek}
              onChange={(e) => setIloscKolejek(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        )}

        {/* Konfiguracja rund (runda_nr, liczba_partii, final_round) */}
        <div className="border p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Rundy</h2>
            <button
              type="button"
              onClick={() =>
                setRundy((prev) => [
                  ...prev,
                  {
                    runda_nr: prev.length + 1,
                    liczba_partii: 1,
                    final_round: false,
                  },
                ])
              }
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Dodaj rundę
            </button>
          </div>
          {rundy.length === 0 ? (
            <p className="text-gray-600">Brak zdefiniowanych rund.</p>
          ) : (
            rundy.map((round, index) => (
              <div key={index} className="border p-2 rounded mb-2">
                <p className="font-semibold">Runda {round.runda_nr}</p>
                <div className="mt-2">
                  <label className="block mb-1">Liczba partii:</label>
                  <input
                    type="number"
                    value={round.liczba_partii}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRundy((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, liczba_partii: val } : r
                        )
                      );
                    }}
                    className="w-full border p-1 rounded"
                  />
                </div>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={round.final_round}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRundy((prev) =>
                          prev.map((r, i) =>
                            i === index ? { ...r, final_round: checked } : r
                          )
                        );
                      }}
                      className="mr-2"
                    />
                    Runda finałowa
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Zapisz turniej
        </button>
      </form>
    </div>
  );
}
