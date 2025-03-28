'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Hasła się różnią.');
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setMessage(signUpError.message);
      return;
    }

    const userId = signUpData?.user?.id;

    if (!userId) {
      setMessage('Błąd przy tworzeniu konta użytkownika.');
      return;
    }

    // Dodajemy użytkownika do tabeli player (email ustawi baza danych automatycznie)
    const { error: insertError } = await supabase.from('player').insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      city,
      province,
      birthdate,
      ranking: 1200,
    });

    if (insertError) {
      setMessage('Błąd przy tworzeniu profilu: ' + insertError.message);
      return;
    }

    setMessage('Konto utworzone! Sprawdź e-mail, aby je potwierdzić.');
    setTimeout(() => router.push('/login'), 5000);
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rejestracja konta</h2>

      {message && <p className="mb-4 text-center text-red-500">{message}</p>}

      <form onSubmit={handleRegister} className="space-y-3">
        <input type="email" placeholder="E-mail" className="w-full border p-2 rounded" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <input type="password" placeholder="Hasło" className="w-full border p-2 rounded" required value={password} onChange={(e) => setPassword(e.target.value)} />

        <input type="password" placeholder="Potwierdź hasło" className="w-full border p-2 rounded" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <input type="text" placeholder="Imię" className="w-full border p-2 rounded" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        <input type="text" placeholder="Nazwisko" className="w-full border p-2 rounded" required value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <input type="text" placeholder="Miasto" className="w-full border p-2 rounded" value={city} onChange={(e) => setCity(e.target.value)} />

        <input type="text" placeholder="Województwo" className="w-full border p-2 rounded" value={province} onChange={(e) => setProvince(e.target.value)} />

        <input type="date" className="w-full border p-2 rounded" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />

        <button className="w-full bg-blue-600 text-white p-2 rounded">Zarejestruj się</button>
      </form>
    </div>
  );
}
