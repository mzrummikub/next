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
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
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
      <div className="flex p-4 justify-start">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="">
      
      {userData ? (
        <div className="p-10 shadow-xl rounded-xl">
          <p className="p-3"><strong>Email:</strong> {userData.email}</p>
          <p className="p-3"><strong>Login:</strong> {userData.login}</p>
          <p className="p-3"><strong>Ranga:</strong> {userData.ranga}</p>
          <p className="p-3">
            <strong>Data utworzenia:</strong> {new Date(userData.created_at).toLocaleString()}
          </p>
          <p className="p-3">
            <strong>Ostatnie logowanie:</strong>{" "}
            {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Brak"}
          </p>
          {/* Formularz edycji danych użytkownika można dodać tutaj */}
          {userData.ranga === "admin" && (
            <div className="p-2 flex justify-center mt-4  rounded-xl bg-blue-500 shadow-lg shadow-blue-500/50">
              <button
                onClick={() => router.push("/create-tournament")}
                className=""
              >
                Utwórz Turniej
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Brak danych użytkownika.</p>
      )}
    </div>
  );
}
