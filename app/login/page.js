'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Błąd: ${error.message}`)
    } else {
      setMessage('Zalogowano pomyślnie!')
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setMessage(`Błąd wylogowania: ${error.message}`)
    } else {
      setMessage('Wylogowano pomyślnie!')
    }
  }

  // Jeśli użytkownik zalogowany
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="p-8 rounded w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Witaj!</h2>
          <p className="mb-4">Jesteś zalogowany jako: {user.email}</p>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded"
          >
            Wyloguj
          </button>

          {message && (
            <p className="text-red-500 mt-2">{message}</p>
          )}
        </div>
      </div>
    )
  }

  // Jeśli niezalogowany -> formularz logowania z przyciskiem "Zarejestruj się"
  return (
    <div className="flex flex-col items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="p-8 rounded w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Logowanie</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-2 px-3 py-2 border rounded text-white"
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 border rounded text-white"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          Zaloguj
        </button>

        {message && (
          <p className="text-center text-red-500 mt-2">{message}</p>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm">Nie masz konta?</p>
          <a href="/register" className="underline text-white">Zarejestruj się</a>
        </div>
      </form>
    </div>
  )
}
