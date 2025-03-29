'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()

  // Pola formularza
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Walidacja na bieżąco
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [message, setMessage] = useState('')

  // Sprawdzenie, czy email już istnieje w tabeli "user"
  const checkEmailExists = async () => {
    if (!email) return
    const { data } = await supabase
      .from('user')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (data) {
      setEmailError('Ten email jest już zajęty.')
    } else {
      setEmailError('')
    }
  }

  // Sprawdzenie, czy username już istnieje w tabeli "user"
  const checkUsernameExists = async () => {
    if (!username) return
    const { data } = await supabase
      .from('user')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (data) {
      setUsernameError('Ta nazwa użytkownika jest już zajęta.')
    } else {
      setUsernameError('')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (emailError || usernameError) {
      setMessage('Popraw błędy formularza.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Hasła nie są zgodne.')
      return
    }

    // Rejestracja w Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Ustawienie linku weryfikacyjnego – po kliknięciu przekierowuje do callback
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (authError) {
      setMessage(`Błąd rejestracji: ${authError.message}`)
      return
    }

    const userId = authData?.user?.id

    // Dodanie wpisu do tabeli "user" (jeśli konto zostało utworzone)
    if (userId) {
      const { error: insertError } = await supabase
        .from('user')
        .insert([{ id: userId, email, username, role: 'user' }])
      if (insertError) {
        setMessage(`Błąd przy zapisie do bazy: ${insertError.message}`)
        return
      }
    }

    setMessage('Konto utworzone! Sprawdź skrzynkę mailową, aby potwierdzić konto.')
    // Opcjonalnie: możesz przekierować do /login po kilku sekundach, jeśli nie chcesz automatycznego logowania
    // setTimeout(() => router.push('/login'), 5000)
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="email"
          placeholder="E-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={checkEmailExists}
          className="w-full border p-2 rounded"
        />
        {emailError && <p className="text-xs text-red-500">{emailError}</p>}
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={checkUsernameExists}
          className="w-full border p-2 rounded"
        />
        {usernameError && <p className="text-xs text-red-500">{usernameError}</p>}
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
