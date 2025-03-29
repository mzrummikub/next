'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Hasła się różnią')
      return
    }

    // 1. Rejestracja w auth.users z linkiem potwierdzającym
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (authError) {
      setMessage(authError.message)
      return
    }

    const userId = authData?.user?.id

    // 2. Dodanie danych do tabeli user, jeśli userId dostępne
    if (userId) {
      const { error: insertError } = await supabase
        .from('user')
        .insert([{ id: userId, email, username, role: 'user' }])

      if (insertError) {
        setMessage(`Błąd przy zapisie do bazy: ${insertError.message}`)
        return
      }
    }

    setMessage('Konto utworzone! Sprawdź maila, aby potwierdzić konto.')
    setTimeout(() => router.push('/login'), 5000)
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Rejestracja</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Hasło"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Potwierdź hasło"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Zarejestruj się
        </button>
      </form>
    </div>
  )
}
