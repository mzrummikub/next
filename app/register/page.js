'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Hasła się nie zgadzają.')
      return
    }

    const verificationToken = uuidv4()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setMessage(`Błąd rejestracji: ${authError.message}`)
      return
    }

    const userId = authData?.user?.id

    if (userId) {
      const { error: insertError } = await supabase.from('user').insert({
        id: userId,
        email,
        username,
        verification_token: verificationToken,
        verified: false,
      })

      if (insertError) {
        setMessage(`Błąd zapisu do bazy: ${insertError.message}`)
        return
      }

      const verificationLink = `https://mzrummikub.vercel.app/api/verify?token=${verificationToken}`

      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          link: verificationLink,
        }),
      })

      if (!response.ok) {
        setMessage('Konto utworzone, ale nie udało się wysłać maila.')
        return
      }

      setMessage('Konto utworzone! Sprawdź maila i kliknij link weryfikacyjny.')
      setTimeout(() => router.push('/login'), 5000)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>

      {message && <p className="mb-4 text-red-500 text-center">{message}</p>}

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
