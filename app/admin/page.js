'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ApproveUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('player').select('*').eq('approved', false);
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const approveUser = async (id) => {
    await supabase.from('player').update({ approved: true }).eq('id', id);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Oczekujące konta:</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} className="flex justify-between items-center py-2">
            <span>{user.email}</span>
            <button className="bg-green-500 text-white p-2 rounded" onClick={() => approveUser(user.id)}>
              Zatwierdź
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
