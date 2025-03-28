'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      setSessionUser(session.user);

      const { data, error } = await supabase
        .from('player')
        .select('admin')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data?.admin) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      fetchPlayers();
    }

    checkAdmin();
  }, [router]);

  async function fetchPlayers() {
    const { data, error } = await supabase.from('player').select('*');
    if (!error) setPlayers(data);
    setLoading(false);
  }

  const handleEditClick = (player) => {
    setEditingId(player.id);
    setEditData(player);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('player')
      .update(editData)
      .eq('id', editingId);

    if (!error) {
      setEditingId(null);
      fetchPlayers();
    } else {
      console.error('Błąd przy aktualizacji danych:', error);
    }
  };

  if (loading) return <div className="p-4">Ładowanie...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel administratora</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Email</th>
            <th className="border p-2">Imię</th>
            <th className="border p-2">Nazwisko</th>
            <th className="border p-2">Miasto</th>
            <th className="border p-2">Województwo</th>
            <th className="border p-2">Data urodzenia</th>
            <th className="border p-2">Ranking</th>
            <th className="border p-2">Zatwierdzony</th>
            <th className="border p-2">Admin</th>
            <th className="border p-2">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id} className="border">
              <td className="border p-2">{player.email}</td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input name="first_name" value={editData.first_name || ''} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.first_name
                )}
              </td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input name="last_name" value={editData.last_name || ''} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.last_name
                )}
              </td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input name="city" value={editData.city || ''} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.city
                )}
              </td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input name="province" value={editData.province || ''} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.province
                )}
              </td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input type="date" name="birthdate" value={editData.birthdate || ''} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.birthdate
                )}
              </td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <input type="number" name="ranking" value={editData.ranking || 0} onChange={handleChange} className="w-full border p-1" />
                ) : (
                  player.ranking
                )}
              </td>
              <td className="border p-2">{player.approved ? '✔️' : '❌'}</td>
              <td className="border p-2">{player.is_admin ? '✔️' : '❌'}</td>
              <td className="border p-2">
                {editingId === player.id ? (
                  <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded">Zapisz</button>
                ) : (
                  <button onClick={() => handleEditClick(player)} className="bg-blue-500 text-white px-2 py-1 rounded">Edytuj</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}