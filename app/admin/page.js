"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats"); // "stats" lub "explore"
  const [stats, setStats] = useState(null);
  const [exploreTable, setExploreTable] = useState("users"); // domyślnie "users"
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Wczytaj statystyki przy starcie
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      setStats(json.stats);
    } catch (err) {
      console.error("Błąd pobierania statystyk:", err.message);
    }
  };

  // Wczytaj dane z wybranej tabeli
  const fetchExploreData = async (table) => {
    try {
      const res = await fetch(`/api/admin/explore?table=${encodeURIComponent(table)}`);
      const json = await res.json();
      setExploreData(json.data);
    } catch (err) {
      console.error("Błąd pobierania danych z tabeli:", err.message);
    }
  };

  useEffect(() => {
    // Przy starcie pobieramy statystyki
    fetchStats().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "explore") {
      fetchExploreData(exploreTable);
    }
  }, [activeTab, exploreTable]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Panel Administratora</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 mr-2 rounded ${
            activeTab === "stats" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Statystyki
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-2 rounded ${
            activeTab === "explore" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
          }`}
        >
          Eksplorator Bazy
        </button>
      </div>
      {activeTab === "stats" && stats && (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Statystyki</h2>
          <ul>
            <li>
              <strong>Auth Users:</strong> {stats.authUsers}
            </li>
            <li>
              <strong>Users:</strong> {stats.users}
            </li>
            <li>
              <strong>Gracz:</strong> {stats.gracz}
            </li>
          </ul>
        </div>
      )}
      {activeTab === "explore" && (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Eksplorator Bazy</h2>
          <div className="mb-4">
            <label className="mr-2">Tabela:</label>
            <select
              value={exploreTable}
              onChange={(e) => setExploreTable(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="auth.users">Auth Users</option>
              <option value="users">Users</option>
              <option value="gracz">Gracz</option>
            </select>
          </div>
          {exploreData ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(exploreData, null, 2)}
            </pre>
          ) : (
            <p>Brak danych.</p>
          )}
        </div>
      )}
    </div>
  );
}
