'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('player')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setCity(data.city || '');
      setProvince(data.province || '');
      setBirthdate(data.birthdate || '');
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('player')
      .update({
        first_name: firstName,
        last_name: lastName,
        city,
        province,
        birthdate,
      })
      .eq('user_id', user.id);

    if (error) {
      setMessage('Błąd przy aktualizacji profilu: ' + error.message);
      return;
    }

    setMessage('Profil został zaktualizowany!');
    setTimeout(() => router.push('/'), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Uzupełnij swój profil</h2>
      {message && <p className="mb-4 text-center text-green-500">{message}</p>}
      <form onSubmit={handleUpdateProfile} className="space-y-3">
        <input type="text" placeholder="Imię" className="w-full border p-2 rounded" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Nazwisko" className="w-full border p-2 rounded" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="text" placeholder="Miasto" className="w-full border p-2 rounded" value={city} onChange={(e) => setCity(e.target.value)} />
        <input type="text" placeholder="Województwo" className="w-full border p-2 rounded" value={province} onChange={(e) => setProvince(e.target.value)} />
        <input type="date" className="w-full border p-2 rounded" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Zapisz dane</button>
      </form>
    </div>
  );
}
