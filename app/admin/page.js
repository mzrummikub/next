'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      // 1. Pobierz aktualną sesję
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Błąd sesji:', sessionError);
      }

      // Jeśli nie ma zalogowanego usera, przekieruj na /login
      if (!session || !session.user) {
        router.push('/login');
        return;
      }

      // Zapisujemy użytkownika, by np. wyświetlić jego email
      setUser(session.user);

      // 2. Sprawdź w tabeli 'player', czy is_admin = true
      const { data: playerData, error: playerError } = await supabase
        .from('player')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();

      if (playerError) {
        console.error('Błąd przy pobieraniu is_admin:', playerError);
        // Tutaj możesz dodać komunikat błędu lub przekierować
      } else {
        // Zapisz w state, czy jest adminem
        setIsAdmin(!!playerData?.is_admin);
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>
      <p><strong>Użytkownik:</strong> {user.email}</p>
      <p><strong>Czy admin?:</strong> {isAdmin ? 'Tak' : 'Nie'}</p>

      {isAdmin ? (
        <div className="mt-4">
          <p>Możesz tu dodać funkcje lub widoki widoczne tylko dla admina.</p>
          {/* Przykład: pobieranie wszystkich graczy, zatwierdzanie itd. */}
        </div>
      ) : (
        <div className="mt-4 text-red-600">
          Nie jesteś adminem.
        </div>
      )}
    </div>
  );
}
