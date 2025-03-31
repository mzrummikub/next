"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

// Jeśli użytkownik już jest zalogowany, przekieruj na /panel
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/panel");
      }
    };
    checkSession();
  }, [router]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    // Używamy metody logowania przy pomocy hasła
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Jeśli otrzymamy komunikat o niepoprawnych danych, wyświetlamy spersonalizowaną wiadomość
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setMessage('Niepoprawny email lub hasło.');
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage('Zalogowano pomyślnie!');
      // Możesz dodać przekierowanie, np. router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-1/2">
      <div className="p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Logowanie</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">Email:</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-1">Hasło:</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Zaloguj się
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-green-500">{message}</p>
        )}
      </div>
    </div>
  );
}
