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
  
  // Stany do sprawdzania dostępności – null: nie sprawdzono, true: zajęty, false: dostępny
  const [emailExists, setEmailExists] = useState(null);
  const [loginExists, setLoginExists] = useState(null);
  
  const [message, setMessage] = useState("");

  // Sprawdź dostępność emaila z tabeli users
  const checkEmail = async (emailToCheck) => {
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(emailToCheck)}`);
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (error) {
      console.error("Błąd przy sprawdzaniu emaila:", error);
    }
  };

  // Sprawdź dostępność loginu z tabeli users
  const checkLogin = async (loginToCheck) => {
    try {
      const res = await fetch(`/api/check-login?login=${encodeURIComponent(loginToCheck)}`);
      const data = await res.json();
      setLoginExists(data.exists);
    } catch (error) {
      console.error("Błąd przy sprawdzaniu loginu:", error);
    }
  };

  // Obsługa rejestracji – tworzy użytkownika w Auth, a następnie rekord w tabeli users
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Hasła nie są identyczne!");
      return;
    }
    if (emailExists) {
      setMessage("Podany email już istnieje!");
      return;
    }
    if (loginExists) {
      setMessage("Podany login już jest zajęty!");
      return;
    }

    // Rejestracja w Supabase Auth, z zapisaniem loginu jako display_name w user_metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: login } },
    });

    console.log("Data z signUp:", data, "Error:", error);
    if (error) {
      setMessage(error.message);
      return;
    }
    
    // Po rejestracji, jeśli mamy user id, wywołujemy endpoint insert-user, aby stworzyć rekord w tabeli users
    const userId = data.user?.id;
    if (userId) {
      try {
        const res = await fetch("/api/insert-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, email, login }),
        });
        const result = await res.json();
        console.log("Wstawianie do tabeli users:", result);
        if (result.error) {
          setMessage("Błąd w tworzeniu rekordu w tabeli users: " + result.error);
          return;
        }
      } catch (err) {
        setMessage("Błąd podczas wywoływania insert-user: " + err.message);
        return;
      }
    }
    
    setMessage("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.");
  };

  return (
    <div className="flex items-center justify-center">
      <div className="p-6 w-1/2">
        <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Pole email */}
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailExists(null); // resetuj stan przy zmianie
              }}
              onBlur={() => { if (email) checkEmail(email); }}
              required
              placeholder=" "
              className="peer w-full border border-white px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-2 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Email
            </label>
            {email && emailExists !== null && (
              <p className={`mt-1 text-xs ${emailExists ? "text-red-500 font-bold" : "text-green-500 font-bold"}`}>
                {emailExists ? "Email już zajęty" : "Email dostępny"}
              </p>
            )}
          </div>

          {/* Pole login */}
          <div className="relative">
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                setLoginExists(null);
              }}
              onBlur={() => { if (login) checkLogin(login); }}
              required
              placeholder=" "
              className="peer w-full border border-white px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="login"
              className="absolute left-3 top-2 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Login
            </label>
            {login && loginExists !== null && (
              <p className={`mt-1 text-xs ${loginExists ? "text-red-500 font-bold " : "text-green-500 font-bold"}`}>
                {loginExists ? "Login już zajęty" : "Login dostępny"}
              </p>
            )}
          </div>

          {/* Pole hasło */}
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-white px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-2 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
            >
              Hasło
            </label>
          </div>

          {/* Pole potwierdzenia hasła */}
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full border border-white px-3 pt-6 pb-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <label
              htmlFor="confirmPassword"
              className="absolute left-3 top-2 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
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
