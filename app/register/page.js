"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [loginExists, setLoginExists] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const checkEmail = async (email) => {
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (error) {
      console.error("Błąd podczas sprawdzania emaila:", error);
    }
  };

  const checkLogin = async (login) => {
    try {
      const res = await fetch(`/api/check-login?login=${encodeURIComponent(login)}`);
      const data = await res.json();
      setLoginExists(data.exists);
    } catch (error) {
      console.error("Błąd podczas sprawdzania loginu:", error);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      checkEmail(email);
    }
  };

  const handleLoginBlur = () => {
    if (login) {
      checkLogin(login);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Hasła nie są identyczne!");
      return;
    }
    if (emailExists) {
      setMessage("Email jest już w użyciu!");
      return;
    }
    if (loginExists) {
      setMessage("Login jest już zajęty!");
      return;
    }

    // Rejestracja użytkownika w auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      // Jeśli udało się utworzyć użytkownika, wstaw dodatkowe dane do tabeli "users"
      const userId = data.user?.id;
      if (userId) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email,
            login,
          });
        if (insertError) {
          setMessage(insertError.message);
          return;
        }
      }
      setMessage("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.");
      
      // Po 5 sekundach wyczyść pola formularza
      setTimeout(() => {
        setEmail("");
        setLogin("");
        setPassword("");
        setConfirmPassword("");
        setEmailExists(false);
        setLoginExists(false);
      }, 5000);
      // Opcjonalnie: przekierowanie do strony logowania
      // router.push('/login');
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-1/2 mx-auto">
      <div className="p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
        <form onSubmit={handleSignUp}>
          {/* Pole email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Email:</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              required
            />
            {emailExists && (
              <p className="text-red-500 text-sm mt-1 text-center">Email jest już w użyciu.</p>
            )}
          </div>
          {/* Pole login */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Login:</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onBlur={handleLoginBlur}
              required
            />
            {loginExists && (
              <p className="text-red-500 text-sm mt-1 text-center">Login jest już zajęty.</p>
            )}
          </div>
          {/* Pole hasła */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Hasło:</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Powtórz hasło */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Powtórz hasło:</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Zarejestruj się
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
