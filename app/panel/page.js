"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PanelPage() {
  const [session, setSession] = useState(null);
  const [userRecordChecked, setUserRecordChecked] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Pobierz aktywną sesję
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
      } else {
        setSession(currentSession);
      }
    };
    getSession();
  }, [router]);

  // Sprawdź, czy rekord użytkownika istnieje; jeśli nie, wstaw go
  useEffect(() => {
    const checkOrInsertUserRecord = async () => {
      if (!session || userRecordChecked) return;
      const userId = session.user.id;
      // Sprawdzenie, czy rekord istnieje
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error || !data) {
        // Jeśli nie znaleziono rekordu, wstaw nowy rekord
        const defaultLogin = session.user.email.split("@")[0];
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: session.user.email,
          login: defaultLogin,
        });
        if (insertError) {
          console.error("Błąd przy wstawianiu rekordu do users:", insertError.message);
        }
      }
      setUserRecordChecked(true);
    };
    checkOrInsertUserRecord();
  }, [session, userRecordChecked]);

  // Pobierz dane użytkownika z tabeli users (po sprawdzeniu/insercie)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) {
        console.error("Błąd pobierania danych użytkownika:", error);
      } else {
        setUserData(data);
      }
    };
    fetchUserData();
  }, [session, userRecordChecked]);

  if (!session || !userRecordChecked) {
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
        {userData ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Login:</strong> {userData.login}
            </p>
            <p>
              <strong>Ranga:</strong> {userData.ranga}
            </p>
            <p>
              <strong>Data utworzenia:</strong>{" "}
              {new Date(userData.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Ostatnie logowanie:</strong>{" "}
              {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Brak"}
            </p>
          </div>
        ) : (
          <p>Brak danych użytkownika.</p>
        )}
      </div>
    </div>
  );
}
