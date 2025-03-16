"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Błąd pobierania użytkownika:", error.message);
        router.push("/login"); // Jeśli użytkownik nie jest zalogowany, przekieruj na login
      } else {
        setUserEmail(data.user?.email);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Przekierowanie po wylogowaniu
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Panel użytkownika</h1>
      {userEmail ? (
        <p className="mt-2 text-gray-700">Zalogowano jako: <strong>{userEmail}</strong></p>
      ) : (
        <p className="mt-2 text-gray-500">Ładowanie...</p>
      )}
      <button
        onClick={handleLogout}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Wyloguj się
      </button>
    </div>
  );
}
