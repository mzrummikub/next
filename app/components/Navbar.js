'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import '@/styles/globals.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function Navbar() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleNavbarLogin = async (e) => {
    e.preventDefault()

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

  return (
    <nav className="w-full px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="mb-2 w-full max-w-[600px] h-auto"
          />
        </div>

        <button
          className="sm:hidden block text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4 space-y-2`}>
        <Link href="/">
          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded">Home</button>
        </Link>
        <Link href="/login">
          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded">Logowanie</button>
        </Link>
      </div>

      {user ? (
        <p className="text-center mt-4">Jesteś zalogowany: {user.email}</p>
      ) : (
        <form onSubmit={handleNavbarLogin} className="hidden sm:flex justify-center items-center gap-2 mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="px-2 py-1 border rounded text-black"
          />

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 border rounded text-black"
          />

          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Zaloguj
          </button>
        </form>
      )}

      {message && <p className="text-sm text-center text-red-500 mt-2">{message}</p>}
      <hr className="w-full border-t border-gray-300 mt-4" />
    </nav>
  )
}
