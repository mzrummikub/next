"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTurniejPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Dane ogólne turnieju
  const [nazwa, setNazwa] = useState("");
  const [miasto, setMiasto] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [limitMiejsc, setLimitMiejsc] = useState(0);
  const [dataTurnieju, setDataTurnieju] = useState("");

  // Format turnieju
  const [typ, setTyp] = useState("zwykły"); // "mistrzowska", "liga", "zwykły"
  const [isKolejka, setIsKolejka] = useState(false);
  const [iloscKolejek, setIloscKolejek] = useState(0);

  // Konfiguracja rund – tablica obiektów: { round_nr, liczba_partii, final_round }
  const [rundy, setRundy] = useState([]);

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

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleAddRound = () => {
    setRundy((prev) => [
      ...prev,
      { round_nr: prev.length + 1, liczba_partii: 1, final_round: false },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Przygotowujemy dane do wysłania:
    // Jeśli typ nie jest "liga", konfiguracja rund to tablica "rundy"
    const body = {
      nazwa,
      typ,
      miasto,
      wojewodztwo,
      limit_miejsc: Number(limitMiejsc),
      data_turnieju: dataTurnieju || null,
      kolejka: typ === "liga" ? true : false,
      ilosc_kolejek: typ === "liga" ? Number(iloscKolejek) : null,
      rundy: typ !== "liga" ? rundy.map((r) => ({
        round_nr: r.round_nr,
        liczba_partii: Number(r.liczba_partii),
        final_round: r.final_round,
      })) : [],
    };

    try {
      const res = await fetch("/api/turniej", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) {
        alert("Błąd: " + json.error);
      } else {
        alert("Turniej utworzony pomyślnie!");
        router.push("/admin/turnieje");
      }
    } catch (err) {
      alert("Błąd: " + err.message);
    }
  };

  // Poszczególne kroki formularza:
  const Step1 = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Krok 1: Dane ogólne turnieju</h2>
      <div className="space-y-4">
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
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          Następny krok
        </button>
      </div>
    </div>
  );

  const Step2 = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Krok 2: Wybór formatu turnieju</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="font-semibold">Typ turnieju:</span>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="mistrzowska">mistrzowska</option>
            <option value="liga">liga</option>
            <option value="zwykły">zwykły</option>
          </select>
        </label>
        {typ === "liga" && (
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
      </div>
      <div className="mt-4 flex justify-between">
        <button onClick={handleBack} className="bg-gray-500 text-white px-4 py-2 rounded">
          Wstecz
        </button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          Następny krok
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Krok 3: Konfiguracja rund</h2>
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleAddRound}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Dodaj rundę
        </button>
        {rundy.length > 0 ? (
          rundy.map((round, index) => (
            <div key={index} className="border p-2 rounded mb-2">
              <p className="font-semibold">Runda {round.round_nr}</p>
              <div className="mt-2">
                <label className="block mb-1">Liczba partii:</label>
                <input
                  type="number"
                  value={round.liczbaPartii}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRundy((prev) =>
                      prev.map((r, i) => (i === index ? { ...r, liczbaPartii: val } : r))
                    );
                  }}
                  className="w-full border p-1 rounded"
                  required
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
                        prev.map((r, i) => (i === index ? { ...r, final_round: checked } : r))
                      );
                    }}
                    className="mr-2"
                  />
                  Runda finałowa (np. jeden stolik)
                </label>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Brak zdefiniowanych rund.</p>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <button onClick={handleBack} className="bg-gray-500 text-white px-4 py-2 rounded">
          Wstecz
        </button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          Następny krok
        </button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Krok 4: Podsumowanie i zatwierdzenie</h2>
      <div className="border p-4 rounded mb-4">
        <p><strong>Nazwa turnieju:</strong> {nazwa}</p>
        <p><strong>Miasto:</strong> {miasto}</p>
        <p><strong>Województwo:</strong> {wojewodztwo}</p>
        <p><strong>Limit miejsc:</strong> {limitMiejsc}</p>
        <p>
          <strong>Data turnieju:</strong> {dataTurnieju ? dataTurnieju : "Nie podano"}
        </p>
        <p>
          <strong>Typ turnieju:</strong> {typ}
        </p>
        {typ === "liga" && (
          <p>
            <strong>Ilość kolejek:</strong> {iloscKolejek}
          </p>
        )}
        {typ !== "liga" && rundy.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold">Konfiguracja rund:</h3>
            <ul className="list-disc ml-6">
              {rundy.map((round, index) => (
                <li key={index}>
                  Runda {round.round_nr}: {round.liczbaPartii} partii
                  {round.final_round ? " (Finałowa)" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <button onClick={handleBack} className="bg-gray-500 text-white px-4 py-2 rounded">
          Wstecz
        </button>
        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
          Zatwierdź turniej
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Utwórz Turniej Rummikub</h1>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
}
