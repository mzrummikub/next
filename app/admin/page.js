"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// UWAGA: Do operacji administracyjnych (np. wykonywania zapytań SQL) należy korzystać z endpointu API, który działa po stronie serwera
// lub funkcji RPC zabezpieczonej kluczem serwisowym. Poniższy supabase client używa klucza anon, co nie pozwala na wykonanie zapytań DDL.
// Ten kod służy tylko celom demonstracyjnym.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("database"); // "database" lub "stats"
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sprawdź sesję i pobierz dane użytkownika
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
        // Pobierz dane z tabeli "users"
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Błąd pobierania danych użytkownika:", error.message);
        } else {
          setUserData(data);
        }
      }
      setIsLoading(false);
    }
    checkSession();
  }, [router]);

  // Tylko admin może korzystać z panelu
  useEffect(() => {
    if (userData && userData.ranga !== "admin") {
      router.push("/panel"); // Przekieruj zwykłych użytkowników do ich panelu
    }
  }, [userData, router]);

  if (isLoading) {
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
          className={`px-4 py-2 mr-2 rounded ${activeTab === "database" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => setActiveTab("database")}
        >
          Baza Danych
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "stats" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => setActiveTab("stats")}
        >
          Statystyki
        </button>
      </div>
      {activeTab === "database" && <DatabaseManagement />}
      {activeTab === "stats" && <Statistics />}
    </div>
  );
}

// Komponent zarządzania bazą danych
function DatabaseManagement() {
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [error, setError] = useState("");

  // Uwaga: W rzeczywistości zapytania SQL należy wykonywać za pomocą endpointu API (serverless function) korzystającego z klucza serwisowego.
  // Poniższy kod symuluje wykonanie zapytania.
  const handleExecuteQuery = async () => {
    setError("");
    setQueryResult(null);
    try {
      // Przykładowe wywołanie endpointu API:
      const res = await fetch("/api/admin/execute-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setQueryResult(result.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Zarządzanie Bazą Danych</h2>
      <textarea
        className="w-full border p-2 rounded mb-4"
        rows="5"
        placeholder="Wpisz zapytanie SQL, np. CREATE TABLE test (id uuid primary key, name text);"
        value={sqlQuery}
        onChange={(e) => setSqlQuery(e.target.value)}
      ></textarea>
      <button onClick={handleExecuteQuery} className="bg-blue-500 text-white px-4 py-2 rounded">
        Wykonaj zapytanie
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {queryResult && (
        <div className="mt-4">
          <h3 className="font-bold">Wynik zapytania:</h3>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(queryResult, null, 2)}</pre>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-600">
        Uwaga: Operacje administracyjne powinny być zabezpieczone i wykonywane po stronie serwera.
      </p>
    </div>
  );
}

// Komponent statystyk
function Statistics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        // Przykład pobrania statystyk – w prawdziwej aplikacji wywołaj dedykowany endpoint API.
        const exampleStats = {
          views: 12345,
          uniqueVisitors: 6789,
          referrals: {
            google: 3000,
            facebook: 2000,
            others: 2345,
          },
          lastUpdated: new Date().toLocaleString(),
        };
        setStats(exampleStats);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Statystyki Strony</h2>
      {error && <p className="text-red-500">{error}</p>}
      {stats ? (
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Liczba wyświetleń:</strong> {stats.views}</p>
          <p><strong>Liczba unikalnych odwiedzających:</strong> {stats.uniqueVisitors}</p>
          <h3 className="font-bold mt-4">Źródła ruchu:</h3>
          <ul className="list-disc ml-6">
            <li><strong>Google:</strong> {stats.referrals.google}</li>
            <li><strong>Facebook:</strong> {stats.referrals.facebook}</li>
            <li><strong>Inne:</strong> {stats.referrals.others}</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            <strong>Ostatnia aktualizacja:</strong> {stats.lastUpdated}
          </p>
        </div>
      ) : (
        <p>Ładowanie statystyk...</p>
      )}
    </div>
  );
}
