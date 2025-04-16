// ✅ app/add/turniej/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CreateTournamentPage() {
  const router = useRouter();
  const [login, setLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    ranga: "Zwykły",
    city: "",
    region: "",
    start_date: "",
    max_players: "",
    total_rounds: "",
    has_final: false,
    final_games_count: "",
  });
  const [roundsConfig, setRoundsConfig] = useState([]);
  const [message, setMessage] = useState("");

  // 1. Sprawdzenie zalogowanego użytkownika
  useEffect(() => {
    const checkUserLogin = async () => {
      console.log("[useEffect] Sprawdzam zalogowanego użytkownika...");
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("[useEffect] Supabase getUser:", { user, error });
      if (!user || error) {
        setLoading(false);
        return;
      }
      const { data: userInfo, error: dbError } = await supabase
        .from("users")
        .select("login")
        .eq("id", user.id)
        .single();
      console.log("[useEffect] Pobranie loginu z tabeli users:", { userInfo, dbError });
      if (!dbError && userInfo) {
        setLogin(userInfo.login);
      }
      setLoading(false);
    };
    checkUserLogin();
  }, []);

  // 2. Aktualizacja konfiguracji rund przy zmianie total_rounds
  useEffect(() => {
    console.log("[useEffect] total_rounds changed:", formData.total_rounds);
    const rounds = [];
    for (let i = 0; i < formData.total_rounds; i++) {
      rounds.push({ round_number: i + 1, games_in_round: 3 });
    }
    console.log("[useEffect] roundsConfig rebuilt:", rounds);
    setRoundsConfig(rounds);
  }, [formData.total_rounds]);

  // 3. Obsługa zmiany liczby partii w rundzie
  const handleRoundsConfigChange = (index, value) => {
    console.log(`[handleRoundsConfigChange] runda ${index + 1}, wartość:`, value);
    const updated = [...roundsConfig];
    updated[index].games_in_round = Number(value);
    setRoundsConfig(updated);
  };

  // 4. Wysyłka formularza
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    console.log("[handleSubmit] Wywołanie handleSubmit");
    console.log("[handleSubmit] Obecne formData:", formData);
    console.log("[handleSubmit] Obecna roundsConfig:", roundsConfig);

    const { data: { session } } = await supabase.auth.getSession();
    console.log("[handleSubmit] Supabase session:", session);
    if (!session) {
      setMessage("Musisz być zalogowany, aby utworzyć turniej.");
      return;
    }

    const token = session.access_token;
    console.log("[handleSubmit] Token użytkownika:", token);

    const payload = {
      ...formData,
      roundsConfig,
      final_games_count: formData.has_final ? formData.final_games_count : null,
    };
    console.log("[handleSubmit] Payload do API:", payload);

    try {
      const response = await fetch("/api/tournament/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("[handleSubmit] Odpowiedź HTTP:", response.status);
      const data = await response.json();
      console.log("[handleSubmit] Odpowiedź z API:", data);
      if (response.ok) {
        console.log("[handleSubmit] Turniej utworzony, przekierowuję...");
        router.push("/admin");
      } else {
        console.error("[handleSubmit] Błąd tworzenia turnieju:", data.error);
        setMessage(data.error || "Wystąpił nieznany błąd.");
      }
    } catch (error) {
      console.error("[handleSubmit] Błąd sieci lub parsowania JSON:", error);
      setMessage("Wystąpił błąd przy próbie przetworzenia odpowiedzi.");
    }
  }

  // 5. Render formularza
  return (
    <form className="max-w-xl mx-auto mt-8 space-y-4 p-6" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Utwórz turniej</h1>

      <input
        className="border p-2 rounded w-full"
        placeholder="Nazwa turnieju"
        required
        value={formData.name}
        onChange={(e) => {
          console.log("[onChange] name:", e.target.value);
          setFormData({ ...formData, name: e.target.value });
        }}
      />

      <select
        className="border p-2 rounded w-full"
        value={formData.ranga}
        onChange={(e) => {
          console.log("[onChange] ranga:", e.target.value);
          setFormData({ ...formData, type: e.target.value });
        }}
      >
        <option value="Mistrzostwa">Mistrzostwa</option>
        <option value="Liga">Liga</option>
        <option value="Zwykły">Zwykły</option>
      </select>

      <input
        className="border p-2 rounded w-full"
        type="date"
        required
        value={formData.start_date}
        onChange={(e) => {
          console.log("[onChange] start_date:", e.target.value);
          setFormData({ ...formData, start_date: e.target.value });
        }}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Miasto"
        required
        value={formData.city}
        onChange={(e) => {
          console.log("[onChange] city:", e.target.value);
          setFormData({ ...formData, city: e.target.value });
        }}
      />

      {/* Region jako lista rozwijana */}
      <div>
        <label className="block font-medium">Województwo:</label>
        <select
          className="border p-2 rounded w-full bg-[#000080] text-white"
          value={formData.region}
          onChange={(e) => {
            console.log("[onChange] region:", e.target.value);
            setFormData({ ...formData, region: e.target.value });
          }}
          required
        >
          <option value="">-- Wybierz województwo --</option>
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
      </div>

      <input
        className="border p-2 rounded w-full"
        type="number"
        placeholder="Max graczy"
        required
        value={formData.max_players}
        onChange={(e) => {
          console.log("[onChange] max_players:", e.target.value);
          setFormData({ ...formData, max_players: Number(e.target.value) });
        }}
      />

      {formData.type !== "Liga" && (
        <>
          <input
            className="border p-2 rounded w-full"
            type="number"
            placeholder="Liczba rund"
            required
            value={formData.total_rounds}
            onChange={(e) => {
              console.log("[onChange] total_rounds:", e.target.value);
              setFormData({ ...formData, total_rounds: Number(e.target.value) });
            }}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_final}
              onChange={() => {
                console.log("[onChange] has_final:", !formData.has_final);
                setFormData({ ...formData, has_final: !formData.has_final });
              }}
              className="mr-2"
            />
            <span>Czy ma finał?</span>
          </div>

          {formData.has_final && (
            <div className="border p-3 rounded">
              <label className="block mb-2 font-semibold">
                Liczba partii w finale:
              </label>
              <input
                className="border p-2 rounded w-full"
                type="number"
                min={1}
                value={formData.final_games_count}
                onChange={(e) => {
                  console.log("[onChange] final_games_count:", e.target.value);
                  setFormData({
                    ...formData,
                    final_games_count: Number(e.target.value),
                  });
                }}
                required
              />
            </div>
          )}

          <div className="space-y-2 border p-4 rounded">
            <strong>Określ liczbę partii w każdej rundzie:</strong>
            {roundsConfig.map((round, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label className="w-1/2">Runda {round.round_number}:</label>
                <input
                  className="border p-2 rounded w-1/2"
                  type="number"
                  min={1}
                  value={round.games_in_round}
                  onChange={(e) => handleRoundsConfigChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Utwórz turniej
      </button>
      {message && <p className="text-red-600 font-bold mt-2">{message}</p>}
    </form>
  );
}
