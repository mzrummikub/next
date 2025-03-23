'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    if (password !== repeatPassword) {
      setMessage('Hasła się różnią!')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(`Błąd: ${error.message}`)
    } else {
      setMessage('Sprawdź swoją skrzynkę pocztową, aby potwierdzić konto!')
    }
  }

  return (
    <div className="flex justify-center w-full">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4 mx-auto">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Potwierdź hasło"
          value={repeatPassword}
          required
          onChange={(e) => setRepeatPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full px-3 py-2 bg-blue-600 text-white rounded"
        >
          Załóż konto
        </button>

        {message && <p className="text-center text-sm text-red-500">{message}</p>}
      </form>
    </div>
  )
}