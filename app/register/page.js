'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Hasła się różnią.');
      return;
    }

    // 1. Rejestracja użytkownika przez Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      return;
    }

    // 2. Aktualizacja user_metadata – ustawienie nazwy użytkownika
    const { error: updateError } = await supabase.auth.updateUser({
      data: { username: username },
    });
    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    // 3. Dodanie dodatkowych danych do tabeli "user"
    const userId = authData.user.id;
    const { error: dbError } = await supabase
      .from('user')
      .insert([{ id: userId, email, username, role: 'user' }]);

    if (dbError) {
      setMessage(dbError.message);
      return;
    }

    setMessage(
      'Konto utworzone! Sprawdź skrzynkę e-mail, aby potwierdzić konto.'
    );
    setTimeout(() => router.push('/login'), 5000);
  };

  return (
    <div className="max-w-sm mx-auto p-6 mt-10 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rejestracja konta</h2>

      {message && <p className="mb-4 text-center text-red-500">{message}</p>}

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          className="w-full border p-2 rounded"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nazwa użytkownika"
          className="w-full border p-2 rounded"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full border p-2 rounded"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Potwierdź hasło"
          className="w-full border p-2 rounded"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Zarejestruj się
        </button>
      </form>
    </div>
  );
}
