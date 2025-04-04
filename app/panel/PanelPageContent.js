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
    <div className="panel max-w-lg p-4">
      
      {userData ? (
        <div className="p-3">
          <p className="p-2"><strong className="">Email:</strong> {userData.email}</p>
          <p className="p-2"><strong>Login:</strong> {userData.login}</p>
          <p className="p-2"><strong>Ranga:</strong> {userData.ranga}</p>
          <p className="p-2">
            <strong>Data utworzenia:</strong> {new Date(userData.created_at).toLocaleString()}
          </p>
          <p className="p-2">
            <strong>Ostatnie logowanie:</strong>{" "}
            {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Brak"}
          </p>
          
        </div>
      ) : (
        <p>Brak danych użytkownika.</p>
      )}
    </div>
  );
}
