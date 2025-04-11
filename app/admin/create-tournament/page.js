"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTurniejPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    type: "casual", // opcje: casual, championship, league
    city: "",
    region: "",
    start_date: "", // data musi być ustawiona
    max_players: 16,
    total_rounds: 3, // dla turnieju typu casual lub championship
    has_final: false, // tylko dla turnieju typu casual/mistrzostwa
  });

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Walidacja – sprawdź czy pole daty nie jest puste
    if (!formData.start_date) {
      console.error("Data turnieju jest wymagana");
      return;
    }
    
    const response = await fetch("/api/tournament/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Po udanym utworzeniu, przekierowujemy do panelu administratora
      router.push("/admin");
    } else {
      console.error("Błąd podczas tworzenia turnieju:", data.error || data);
    }
  }
  
  return (
    <form className="max-w-xl mx-auto mt-8 space-y-4 p-6" onSubmit={handleSubmit}>
      <input
        className="border p-2 rounded w-full"
        placeholder="Nazwa turnieju"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <select
        className="border p-2 rounded w-full"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="casual">Zwykły</option>
        <option value="championship">Mistrzostwa</option>
        <option value="league">Liga</option>
      </select>
      
      <input
        className="border p-2 rounded w-full"
        type="date"
        required
        value={formData.start_date}
        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
      />
      
      <input
        className="border p-2 rounded w-full"
        placeholder="Miasto"
        required
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      />
      
      <input
        className="border p-2 rounded w-full"
        placeholder="Województwo"
        required
        value={formData.region}
        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
      />
      
      <input
        className="border p-2 rounded w-full"
        type="number"
        placeholder="Max graczy"
        required
        value={formData.max_players}
        onChange={(e) => setFormData({ ...formData, max_players: Number(e.target.value) })}
      />

      {/* Dla turnieju, który nie jest typu "league" */}
      {formData.type !== "league" && (
        <>
          <input
            className="border p-2 rounded w-full"
            type="number"
            placeholder="Liczba rund"
            required
            value={formData.total_rounds}
            onChange={(e) => setFormData({ ...formData, total_rounds: Number(e.target.value) })}
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_final}
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
