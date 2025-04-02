"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pobierz sesję i przekieruj, jeśli nie ma zalogowanego użytkownika
  useEffect(() => {
    async function getSession() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
      }
    }
    getSession();
  }, [router]);

  // Pobierz dane użytkownika z tabeli "users"
  useEffect(() => {
    async function fetchUserData() {
      if (!session) return;
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
      setLoading(false);
    }
    fetchUserData();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="justify-items-start p-4">
      <h1 className="text-2xl font-bold mb-4">Twój Panel</h1>
      {userData ? (
        <div className="p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Login:</strong> {userData.login}</p>
          <p><strong>Ranga:</strong> {userData.ranga}</p>
          <p>
            <strong>Data utworzenia:</strong> {new Date(userData.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Ostatnie logowanie:</strong>{" "}
            {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Brak"}
          </p>
          {/* Możesz dodać tu formularz do edycji własnych danych */}
        </div>
      ) : (
        <p>Brak danych użytkownika.</p>
      )}
    </div>
  );
}
