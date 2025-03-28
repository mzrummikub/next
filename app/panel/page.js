'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function UserPanel() {
  const [sessionUser, setSessionUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      // Pobierz sesję użytkownika z Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push('/login');
        return;
      }
      setSessionUser(session.user);

      // Pobierz dodatkowe dane użytkownika z tabeli "user"
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Błąd przy pobieraniu danych użytkownika:', error);
        setMessage('Nie udało się pobrać danych.');
      } else {
        setUserData(data);
      }
      setLoading(false);
    }
    fetchUserData();
  }, [router]);

  // Aktualizacja pól formularza
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Obsługa zatwierdzania zmian – wymagamy podania aktualnego hasła
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Weryfikacja hasła – sprawdzamy, czy podane hasło jest poprawne
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: sessionUser.email,
      password: currentPassword,
    });

    if (authError) {
      setMessage('Błąd potwierdzenia hasłem: ' + authError.message);
      return;
    }

    // Jeśli hasło jest poprawne, aktualizujemy dane w tabeli "user"
    const { error } = await supabase
      .from('user')
      .update({
        username: userData.username,
        // Możesz tutaj dodać inne pola do aktualizacji, jeśli to konieczne
      })
      .eq('id', sessionUser.id);

    if (error) {
      console.error('Błąd przy aktualizacji danych:', error);
      setMessage('Błąd przy zapisie danych.');
    } else {
      setMessage('Dane zostały zaktualizowane.');
      setEditMode(false);
    }
    // Czyścimy pole hasła
    setCurrentPassword('');
  };

  if (loading) return <div className="p-4">Ładowanie danych...</div>;
  if (!userData) return <div className="p-4 text-red-600">Nie znaleziono Twojego profilu.</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>
      <p className="mb-4 text-gray-700">
        Zalogowany jako: <strong>{sessionUser.email}</strong>
      </p>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {!editMode ? (
        <div className="space-y-2">
          <p><strong>Email:</strong> {userData.email || '-'}</p>
          <p><strong>Nazwa użytkownika:</strong> {userData.username || '-'}</p>
          <p><strong>Rola:</strong> {userData.role || '-'}</p>
          <p>
            <strong>Data utworzenia:</strong>{' '}
            {userData.created_at ? new Date(userData.created_at).toLocaleString() : '-'}
          </p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edytuj dane
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            value={userData.username || ''}
            onChange={handleChange}
            placeholder="Nazwa użytkownika"
            className="w-full border p-2 rounded"
          />
          {/* Możesz dodać więcej pól do edycji, jeśli potrzebujesz */}
          <input
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Podaj aktualne hasło"
            required
            className="w-full border p-2 rounded"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Zapisz zmiany
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
