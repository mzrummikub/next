"use client"; // Użycie trybu klienta – kod będzie wykonywany po stronie przeglądarki

// Import hooka useState z React, który umożliwia korzystanie ze stanu komponentu
import { useState } from "react";
// Import funkcji createClient z biblioteki Supabase, która służy do inicjalizacji klienta Supabase
import { createClient } from "@supabase/supabase-js";

// Pobranie adresu Supabase i klucza anon (publicznego) z zmiennych środowiskowych
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Inicjalizacja klienta Supabase przy użyciu pobranych zmiennych
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcja główna komponentu odpowiedzialnego za stronę rejestracji
export default function RegisterPage() {
  // Stan przechowujący wartość emaila wpisaną przez użytkownika
  const [email, setEmail] = useState("");
  // Stan przechowujący wartość loginu wpisaną przez użytkownika
  const [login, setLogin] = useState("");
  // Stan przechowujący wartość hasła wpisaną przez użytkownika
  const [password, setPassword] = useState("");
  // Stan przechowujący wartość potwierdzenia hasła wpisaną przez użytkownika
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Stany sprawdzające dostępność – null: nie sprawdzono, true: zajęty, false: dostępny
  const [emailExists, setEmailExists] = useState(null);
  const [loginExists, setLoginExists] = useState(null);
  
  // Stan przechowujący komunikaty, które będą wyświetlane użytkownikowi (np. błędy lub potwierdzenia)
  const [message, setMessage] = useState("");

  // Funkcja służąca do sprawdzania czy email już występuje w tabeli "users"
  const checkEmail = async (emailToCheck) => {
    try {
      // Wysyłamy zapytanie do API (endpoint /api/check-email) z przekazanym emailem (zakodowanym)
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(emailToCheck)}`);
      // Odczytujemy odpowiedź z API jako JSON
      const data = await res.json();
      // Aktualizacja stanu na podstawie otrzymanych danych – true jeśli email istnieje, false jeśli nie
      setEmailExists(data.exists);
    } catch (error) {
      // W przypadku błędu wypisujemy go w konsoli
      console.error("Błąd przy sprawdzaniu emaila:", error);
    }
  };

  // Funkcja sprawdzająca dostępność loginu w tabeli "users"
  const checkLogin = async (loginToCheck) => {
    try {
      // Wysyłamy zapytanie do API (endpoint /api/check-login) z loginem jako parametrem
      const res = await fetch(`/api/check-login?login=${encodeURIComponent(loginToCheck)}`);
      // Parsujemy odpowiedź jako JSON
      const data = await res.json();
      // Aktualizacja stanu – true jeśli login już istnieje, false gdy jest dostępny
      setLoginExists(data.exists);
    } catch (error) {
      // Wyświetlamy błąd w konsoli, jeśli coś poszło nie tak
      console.error("Błąd przy sprawdzaniu loginu:", error);
    }
  };

  // Funkcja obsługująca rejestrację użytkownika
  // Tworzy użytkownika w Supabase Auth, a następnie dodaje rekord do tabeli "users"
  const handleRegister = async (e) => {
    e.preventDefault(); // Zapobiegamy domyślnemu zachowaniu formularza (odświeżanie strony)
    setMessage(""); // Resetujemy komunikat przed kolejnymi akcjami

    // Sprawdzamy, czy wpisane hasła są zgodne
    if (password !== confirmPassword) {
      setMessage("Hasła nie są identyczne!");
      return;
    }

    // Sprawdzamy, czy email jest już zajęty
    if (emailExists) {
      setMessage("Podany email już istnieje!");
      return;
    }

    // Sprawdzamy, czy login jest już zajęty
    if (loginExists) {
      setMessage("Podany login już jest zajęty!");
      return;
    }

    // Próba rejestracji użytkownika w Supabase Auth
    // Opcja 'options' służy do przekazania dodatkowych danych, tutaj login jako display_name
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: login } },
    });

    console.log("Data z signUp:", data, "Error:", error);
    
    // Jeśli wystąpił błąd podczas rejestracji, wyświetlamy komunikat o błędzie
    if (error) {
      setMessage(error.message);
      return;
    }
    
    // Po udanej rejestracji sprawdzamy czy mamy id użytkownika (user id)
    const userId = data.user?.id;
    if (userId) {
      try {
        // Wywołanie API (endpoint "/api/insert-user") odpowiedzialnego za dodanie rekordu do tabeli "users"
        // Przesyłamy metodą POST obiekt z id, emailem oraz loginem
        const res = await fetch("/api/insert-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, email, login }),
        });
        // Odczytujemy wynik jako JSON
        const result = await res.json();
        console.log("Wstawianie do tabeli users:", result);
        // Jeżeli API zwróci błąd, wyświetlamy odpowiedni komunikat
        if (result.error) {
          setMessage("Błąd w tworzeniu rekordu w tabeli users: " + result.error);
          return;
        }
      } catch (err) {
        // W przypadku błędu podczas wywoływania endpointu informujemy użytkownika
        setMessage("Błąd podczas wywoływania insert-user: " + err.message);
        return;
      }
    }
    
    // Po zakończeniu rejestracji wyświetlamy komunikat informujący użytkownika o konieczności weryfikacji emaila
    setMessage("Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.");
  };

  return (
    // Główny kontener strony, centrowanie elementów przy użyciu klas Tailwind CSS
    <div className="flex items-center justify-center">
      <div className="p-6 w-1/2">
        <h2 className="text-2xl font-bold text-center mb-6">Rejestracja</h2>
        {/* Formularz rejestracji, wywołuje handleRegister przy submit */}
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Pole email */}
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              // Aktualizacja stanu email przy zmianie wartości
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailExists(null); // Resetujemy stan dostępności przy każdej zmianie
              }}
              // Po opuszczeniu pola (onBlur) wywołujemy funkcję sprawdzającą dostępność emaila
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
            {/* Wyświetlenie komunikatu informującego o dostępności emaila */}
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
              // Aktualizacja stanu loginu przy każdej zmianie wartości
              onChange={(e) => {
                setLogin(e.target.value);
                setLoginExists(null); // Reset stanu przy zmianie
              }}
              // Wywołanie funkcji checkLogin, gdy użytkownik opuści pole
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
            {/* Wyświetlenie komunikatu informującego o dostępności loginu */}
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
              // Aktualizacja stanu hasła
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
              // Aktualizacja stanu potwierdzenia hasła
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

          {/* Przycisk służący do wysłania formularza */}
          <button
            type="submit"
            className="w-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white py-4 rounded-xl hover:bg-blue-600 transition font-bold"
          >
            Zarejestruj się
          </button>
        </form>
        {/* Wyświetlenie komunikatu wynikowego (np. błędu lub informacji o pomyślnej rejestracji) */}
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
