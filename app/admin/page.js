"use client";

import { useState, useEffect } from "react";

export default function MiniPanelVisits() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/visit-stats");
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setStats(json.stats);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie statystyk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded">
        <p>Błąd: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Statystyki Wizyt</h2>
      <p className="mb-2">
        <strong>Łączna liczba wizyt:</strong> {stats.totalVisits}
      </p>
      <div className="mb-2">
        <strong>Wizyty według kraju:</strong>
        {stats.visitsByCountry && stats.visitsByCountry.length > 0 ? (
          <ul className="list-disc pl-4">
            {stats.visitsByCountry.map((item) => (
              <li key={item.country}>
                {item.country}: {item.count}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak danych.</p>
        )}
      </div>
      <div>
        <strong>Wizyty według przeglądarki:</strong>
        {stats.visitsByBrowser && stats.visitsByBrowser.length > 0 ? (
          <ul className="list-disc pl-4">
            {stats.visitsByBrowser.map((item) => (
              <li key={item.browser}>
                {item.browser}: {item.count}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak danych.</p>
        )}
      </div>
    </div>
  );
}
