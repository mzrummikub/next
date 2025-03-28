'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      // Pobierz sesję
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        // Jeśli nie ma zalogowanego usera, przekieruj na logowanie
        router.push('/login');
        return;
      }

      // Chcesz tu też sprawdzić, czy user to admin (np. przez role w DB)
      // Załóżmy, że rola admina jest w kolumnie 'is_admin' w tabeli 'player'
      // lub w metadata. Tutaj pokazuję wersję z 'player'.
      
      const { data: playerData, error } = await supabase
        .from('player')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single();
      
      if (error || !playerData?.is_admin) {
        // Jeśli błąd albo is_admin = false, przekieruj np. na stronę główną
        router.push('/');
      } else {
        setUser(session.user);
      }
    }

    checkUser();
  }, [router]);

  if (!user) {
    return <div className="p-4">Ładowanie...</div>;
  }

  return (
    <div className="p-4">
      <h1>Panel Administratora</h1>
      {/* Cała reszta logiki /admin tutaj */}
    </div>
  );
}
