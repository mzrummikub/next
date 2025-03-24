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

      {/********************************************************************
        SEKCJA MOBILNA (poniżej 640px): trzy wiersze
      ********************************************************************/}
      <div className="sm:hidden flex flex-col w-full">
        
        {/** RZĄD 1: Hamburger w prawym górnym rogu */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl text-white p-2 rounded"
          >
            ☰
          </button>
        </div>

        {/** RZĄD 2: Logo wyśrodkowane */}
        <div className="flex justify-center my-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}      
            height={0}
            className="w-full max-w-[640px] h-auto"
          />
        </div>

        {/** Jeśli isMenuOpen == true, to pokazujemy rozwijane menu */}
        {isMenuOpen && (
          <div className="mt-2 space-y-2">
            <Link href="/">
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded">
                Home
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded">
                Logowanie
              </button>
            </Link>
          </div>
        )}

        {/** RZĄD 3: Informacja o zalogowaniu albo formularz logowania */}
        {user ? (
          <p className="text-center mt-4">
            Jesteś zalogowany: {user.email}
          </p>
        ) : (
          <form
            onSubmit={handleNavbarLogin}
            className="flex flex-col items-center gap-2 mt-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="px-2 py-1 border rounded text-black w-3/4"
            />
            <input
              type="password"
              placeholder="Hasło"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="px-2 py-1 border rounded text-black w-3/4"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Zaloguj
            </button>
          </form>
        )}
      </div>

      {/********************************************************************
        SEKCJA DESKTOPOWA (powyżej 640px)
      ********************************************************************/}
      <div className="hidden sm:block">
        {/* Logo wyśrodkowane */}
        <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}
            height={0}
            className="w-full max-w-[640px] h-auto"
          />
        </div>

        {/** Jeśli zalogowany -> wyświetl e-mail, w przeciwnym razie formularz */}
        {user ? (
          <p className="text-center mt-4">Jesteś zalogowany: {user.email}</p>
        ) : (
          <form
            onSubmit={handleNavbarLogin}
            className="flex justify-center items-center gap-2 mt-4"
          >
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
      </div>

      {/** Wiadomości o błędach */}
      {message && (
        <p className="text-sm text-center text-red-500 mt-2">{message}</p>
      )}

      <hr className="w-full border-t border-gray-300 mt-4" />
    </nav>
  )
}
