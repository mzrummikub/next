"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Hasła nie są identyczne!");
      return;
    }
    // Rejestracja w auth z dodatkowym user_metadata (ustawiamy ranga na "user")
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ranga: "user" }
      }
    });
    if (error) {
      setMessage(error.message);
    } else {
      // Po rejestracji w auth dodajemy rekord do tabeli users
      const userId = data.user?.id;
      if (userId) {
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: email,
          login: login
          // kolumna ranga przyjmie domyślną wartość "user" zdefiniowaną w tabeli
        });
        if (insertError) {
          setMessage(insertError.message);
          return;
        }
      }
      setMessage("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.");
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-1/2 mx-auto">
      <div className="p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Email:</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Login:</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Hasło:</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Powtórz hasło:</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Zarejestruj się
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
