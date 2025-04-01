"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pobierz sesję i przekieruj, jeśli nie jest zalogowany
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
    }
    fetchUserData();
  }, [session]);

  // Jeśli zalogowany użytkownik nie ma roli admin, przekieruj do panelu użytkownika
  useEffect(() => {
    if (userData && userData.ranga !== "admin") {
      router.push("/panel");
    }
  }, [userData, router]);

  // Pobierz wszystkich użytkowników z tabeli "users"
  useEffect(() => {
    async function fetchAllUsers() {
      if (!userData || userData.ranga !== "admin") return;
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Błąd pobierania wszystkich użytkowników:", error.message);
      } else {
        setAllUsers(data);
      }
      setLoading(false);
    }
    fetchAllUsers();
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Login</th>
              <th className="border p-2">Ranga</th>
              <th className="border p-2">Data utworzenia</th>
              <th className="border p-2">Ostatnie logowanie</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.login}</td>
                <td className="border p-2">{user.ranga}</td>
                <td className="border p-2">{new Date(user.created_at).toLocaleString()}</td>
                <td className="border p-2">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : "Brak"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
