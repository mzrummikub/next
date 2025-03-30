"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicjalizacja klienta Supabase dla operacji autoryzacyjnych
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Funkcja sprawdzająca czy email istnieje (zapytanie do API)
  const checkEmail = async (email) => {
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailExists(data.exists);
    } catch (error) {
      console.error("Błąd podczas sprawdzania emaila:", error);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      checkEmail(email);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Hasła nie są identyczne!');
      return;
    }
    if (emailExists) {
      setMessage('Email jest już w użyciu!');
      return;
    }
    // Rejestracja użytkownika
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Rejestracja zakończona! Sprawdź swój email w celu weryfikacji konta.');
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
      <form onSubmit={handleSignUp}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            required
          />
          {emailExists && <p style={{ color: 'red' }}>Email jest już w użyciu.</p>}
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Powtórz hasło:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zarejestruj się</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
