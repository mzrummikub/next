"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Sprawdzenie czy hasła się zgadzają
    if (password !== confirmPassword) {
      setError("Hasła się różnią.");
      return;
    }

    // Rejestracja w Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: dbError } = await supabase.from("user").insert([
        {
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        },
      ]);

      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess("Konto zostało utworzone! Sprawdź swoją skrzynkę pocztową, aby potwierdzić adres e-mail.");
        // Opcjonalnie – można wyczyścić formularz:
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");

        // Możesz przekierować użytkownika np. po kilku sekundach:
        setTimeout(() => {
          router.push("/login");
        }, 5000); // 5 sekund opóźnienia
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm p-6 rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Zarejestruj się</h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-500 text-center mb-3">{success}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Imię"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />
          <input
            type="text"
            placeholder="Nazwisko"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />
          <input
            type="password"
            placeholder="Potwierdź hasło"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded text-white"
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Zarejestruj się
          </button>
        </form>
      </div>
    </div>
  );
}
