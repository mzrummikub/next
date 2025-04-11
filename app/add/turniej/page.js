"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTurniejPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    type: "casual", // dostępne opcje: casual, championship, league
    city: "",
    region: "",
    start_date: "",
    max_players: 16,
    total_rounds: 3, // używane tylko dla turnieju typu casual lub championship
    has_final: false, // używane tylko dla turnieju typu casual lub championship
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/tournament/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin");
      } else {
        console.error("Błąd podczas tworzenia turnieju:", data.error || data);
      }
    } catch (error) {
      console.error("Błąd sieciowy:", error);
    }
  }

  return (
    <form className="max-w-xl mx-auto mt-8 space-y-4 p-6" onSubmit={handleSubmit}>
      <input
        className="border p-2 rounded w-full"
        placeholder="Nazwa turnieju"
        required
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <select
        className="border p-2 rounded w-full"
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        defaultValue={formData.type}
      >
        <option value="casual">Zwykły</option>
        <option value="championship">Mistrzostwa</option>
        <option value="league">Liga</option>
      </select>

      <input
        className="border p-2 rounded w-full"
        type="date"
        required
        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Miasto"
        required
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      />

      <input
        className="border p-2 rounded w-full"
        placeholder="Województwo"
        required
        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
      />

      <input
        className="border p-2 rounded w-full"
        type="number"
        placeholder="Max graczy"
        required
        onChange={(e) => setFormData({ ...formData, max_players: Number(e.target.value) })}
      />

      {formData.type !== "league" && (
        <>
          <input
            className="border p-2 rounded w-full"
            type="number"
            placeholder="Liczba rund"
            required
            onChange={(e) => setFormData({ ...formData, total_rounds: Number(e.target.value) })}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              onChange={() => setFormData({ ...formData, has_final: !formData.has_final })}
              className="mr-2"
            />
            <span>Czy ma finał?</span>
          </div>
        </>
      )}

      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Utwórz turniej
      </button>
    </form>
  );
}
