"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Inicjalizacja klienta Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const router = useRouter();

  // Sprawdzamy, czy użytkownik jest zalogowany oraz pobieramy dane z tabeli "users"
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
        fetchUserData(currentSession.user.id);
      }
    };

    getSession();
  }, [router]);

  // Pobieramy dane użytkownika z tabeli "users" dla aktualnego usera
  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
    } else {
      setUserData(data);
      setUsername(data.login); // inicjalnie ustawiamy username z kolumny "login"
    }
    setLoading(false);
  };

  // Aktualizacja username (kolumna "login")
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!username) return;
    const { data, error } = await supabase
      .from("users")
      .update({ login: username })
      .eq("id", session.user.id);
    if (error) {
      setUpdateMessage(error.message);
    } else {
      setUpdateMessage("Username zaktualizowany pomyślnie!");
      fetchUserData(session.user.id); // odświeżamy dane
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
        {userData && (
          <div className="mb-6">
            <p>
              <span className="font-semibold">Email:</span> {userData.email}
            </p>
            <p>
              <span className="font-semibold">Username:</span> {userData.login}
            </p>
            <p>
              <span className="font-semibold">Ranga:</span> {userData.ranga}
            </p>
            <p>
              <span className="font-semibold">Data utworzenia:</span>{" "}
              {new Date(userData.created_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Ostatnie logowanie:</span>{" "}
              {userData.last_login
                ? new Date(userData.last_login).toLocaleString()
                : "Brak"}
            </p>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Zmień username</h2>
        <form onSubmit={handleUpdateUsername}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Nowy username:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            Aktualizuj username
          </button>
        </form>
        {updateMessage && (
          <p className="mt-4 text-center text-gray-700">{updateMessage}</p>
        )}
      </div>
    </div>
  );
}
