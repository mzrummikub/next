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
    type: "casual",
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

  useEffect(() => {
    const checkUserLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        setLoading(false);
        return;
      }

      const { data: userInfo, error: dbError } = await supabase
        .from("users")
        .select("login")
        .eq("id", user.id)
        .single();

      if (!dbError && userInfo) {
        setLogin(userInfo.login);
      }

      setLoading(false);
    };

    checkUserLogin();
  }, []);

  useEffect(() => {
    const rounds = [];
    for (let i = 0; i < formData.total_rounds; i++) {
      rounds.push({ round_number: i + 1, games_in_round: 3 });
    }
    setRoundsConfig(rounds);
  }, [formData.total_rounds]);

  const handleRoundsConfigChange = (index, value) => {
    const updated = [...roundsConfig];
    updated[index].games_in_round = Number(value);
    setRoundsConfig(updated);
  };

async function handleSubmit(e) {
  e.preventDefault();
  setMessage("");

  // Pobierz sesję na frontendzie
  const { data: { session } } = await supabase.auth.getSession();
  console.log("🧪 Sesja na frontendzie:", session);

  if (!session) {
    setMessage("Musisz być zalogowany, aby utworzyć turniej.");
    return;
  }

  const token = session.access_token;
  console.log("🧪 Token:", token);

  const response = await fetch("/api/tournament/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...formData,
      roundsConfig,
      final_games_count: formData.has_final ? formData.final_games_count : null,
    }),
  });

  try {
    const data = await response.json(); // Próba sparsowania JSON
    if (response.ok) {
      router.push("/admin");
    } else {
      console.error("Błąd tworzenia turnieju:", data.error);
      setMessage(data.error || "Wystąpił nieznany błąd.");
    }
  } catch (error) {
    console.error("Błąd przy odczycie odpowiedzi JSON:", error);
    setMessage("Wystąpił błąd przy próbie przetworzenia odpowiedzi.");
  }
}

  

  return (
    <form className="max-w-xl mx-auto mt-8 space-y-4 p-6" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold">Utwórz turniej</h1>

      <input className="border p-2 rounded w-full" placeholder="Nazwa turnieju" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

      <select className="border p-2 rounded w-full" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
        <option value="casual">Zwykły</option>
        <option value="championship">Mistrzostwa</option>
        <option value="league">Liga</option>
      </select>

      <input className="border p-2 rounded w-full" type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
      <input className="border p-2 rounded w-full" placeholder="Miasto" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
      <input className="border p-2 rounded w-full" placeholder="Województwo" required value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
      <input className="border p-2 rounded w-full" type="number" placeholder="Max graczy" required value={formData.max_players} onChange={(e) => setFormData({ ...formData, max_players: Number(e.target.value) })} />

      {formData.type !== "league" && (
        <>
          <input className="border p-2 rounded w-full" type="number" placeholder="Liczba rund" required value={formData.total_rounds} onChange={(e) => setFormData({ ...formData, total_rounds: Number(e.target.value) })} />

          <div className="flex items-center">
            <input type="checkbox" checked={formData.has_final} onChange={() => setFormData({ ...formData, has_final: !formData.has_final })} className="mr-2" />
            <span>Czy ma finał?</span>
          </div>

          {formData.has_final && (
            <div className="border p-3 rounded">
              <label className="block mb-2 font-semibold">Liczba partii w finale:</label>
              <input className="border p-2 rounded w-full" type="number" min={1} value={formData.final_games_count} onChange={(e) => setFormData({ ...formData, final_games_count: Number(e.target.value) })} required />
            </div>
          )}

          <div className="space-y-2 border p-4 rounded">
            <strong>Określ liczbę partii w każdej rundzie:</strong>
            {roundsConfig.map((round, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label className="w-1/2">Runda {round.round_number}:</label>
                <input className="border p-2 rounded w-1/2" type="number" min={1} value={round.games_in_round} onChange={(e) => handleRoundsConfigChange(idx, e.target.value)} />
              </div>
            ))}
          </div>
        </>
      )}

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Utwórz turniej</button>
      {message && <p className="text-red-600 font-bold mt-2">{message}</p>}
    </form>
  );
}