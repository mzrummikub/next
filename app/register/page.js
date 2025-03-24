"use client"; // Jeśli używasz App Router
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

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

    // Jeśli użytkownik został utworzony, dodajemy go do tabeli "user"
    if (user) {
      const { error: dbError } = await supabase.from("user").insert([
        {
          id: user.id, // ID z Supabase Auth
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        },
      ]);

      if (dbError) {
        setError(dbError.message);
      } else {
        router.push("/dashboard"); // Przekierowanie po rejestracji
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm p-6 rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Zarejestruj się</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
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
