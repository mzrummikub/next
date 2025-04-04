  "use client";

import { useStat, useEffect } from "react";
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
    // Rejestracja w Auth z dodatkowym user_metadata (display_name)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: login } // zapisujemy login w user_metadata
      }
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Floting label - Rejestracja */}
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-gray-300 px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Email
            </label>
          </div>

          {/* Floting label - Login */}
          <div className="relative">
            <input
              type="text"
              id="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-gray-300 px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="text"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Login
            </label>
          </div>

          {/* Floating label - Hasło */}
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-gray-300 px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Hasło
            </label>
          </div>

          {/* Floating label - Potwierdzenie Hasło */}
          <div className="relative">
            <input
              type="password"
              id="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-gray-300 px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Powtórz Hasło
            </label>
          </div>




          <button
            type="submit"
            className="w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-4 rounded-xl hover:bg-blue-600 transition font-bold"
          >
            Zarejestruj się
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
