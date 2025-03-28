'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminAndFetchData() {
      // 1. Pobierz aktualną sesję
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Błąd sesji:', sessionError);
      }

      // Jeśli użytkownik nie jest zalogowany – przekieruj do /login
      if (!session || !session.user) {
        router.push('/login');
        return;
      }

      // 2. Sprawdź w tabeli 'player', czy is_admin = true
      const { data: playerData, error: playerError } = await supabase
        .from('player')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();

      if (playerError || !playerData) {
        console.error('Błąd przy pobieraniu danych gracza:', playerError);
        // Brak rekordu – nie powinno się zdarzyć, ale na wszelki wypadek...
        router.push('/');
        return;
      }

      // Jeżeli is_admin = false lub null – przekieruj na stronę główną
      if (!playerData.is_admin) {
        router.push('/');
        return;
      }

      // 3. Skoro użytkownik to admin – pobierz wszystkie rekordy z player
      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('player')
        .select('*'); // wybieramy wszystkie kolumny, możesz ograniczyć do wybranych

      if (allPlayersError) {
        console.error('Błąd przy pobieraniu rekordów:', allPlayersError);
      }

      setRecords(allPlayers || []);
      setLoading(false);
    }

    checkAdminAndFetchData();
  }, [router]);

  if (loading) {
    return <div className="p-4">Wczytywanie...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>
      {records.length === 0 ? (
        <p>Brak rekordów w tabeli <strong>player</strong>.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="border-b">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Imię</th>
              <th className="border p-2">Nazwisko</th>
              <th className="border p-2">Miasto</th>
              <th className="border p-2">Województwo</th>
              <th className="border p-2">Data urodzenia</th>
              <th className="border p-2">Ranking</th>
              <th className="border p-2">Approved</th>
              <th className="border p-2">Admin</th>
            </tr>
          </thead>
          <tbody>
            {records.map((player) => (
              <tr key={player.id} className="border-b">
                <td className="border p-2">{player.id}</td>
                <td className="border p-2">{player.email}</td>
                <td className="border p-2">{player.first_name}</td>
                <td className="border p-2">{player.last_name}</td>
                <td className="border p-2">{player.city}</td>
                <td className="border p-2">{player.province}</td>
                <td className="border p-2">{player.birthdate}</td>
                <td className="border p-2">{player.ranking}</td>
                <td className="border p-2">
                  {player.approved ? 'Tak' : 'Nie'}
                </td>
                <td className="border p-2">
                  {player.is_admin ? 'Tak' : 'Nie'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
