'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import '@/styles/globals.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function Navbar() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Pobieramy dane z tabeli "user", na podstawie id z auth.users
        const { data, error } = await supabase
          .from('user')
          .select('username')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Błąd przy pobieraniu username z tabeli user:', error)
        } else {
          setUsername(data.username)
        }
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('user')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error) setUsername(data.username)
          })
      } else {
        setUsername(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav>
      {/* MOBILE */}
      <div className="sm:hidden flex flex-col w-full">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button onClick={handleLogout} className="text-white text-xs px-2 py-2">
                  Wyloguj się {username || '...'}
                </button>
                <Link href="/panel">
                  <button className="text-white text-xs px-2 py-2">
                    Panel gracza
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-white text-xs px-2 py-2">
                    Zaloguj się
                  </button>
                </Link>
                <Link href="/register">
                  <button className="text-white text-xs px-2 py-2">
                    Zarejestruj się
                  </button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl text-white p-2 rounded"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        <div className="flex justify-center my-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}
            height={0}
            className="w-full max-w-[640px] h-auto"
          />
        </div>

        {isMenuOpen && (
          <div className="w-auto mt-2 flex flex-col items-center space-y-2">
            <Link href="/">
              <button className="w-60 px-2 py-2 bg-blue-600 text-white rounded-xl">
                Home
              </button>
            </Link>
            <Link href="/panel">
              <button className="w-60 px-2 py-2 bg-blue-600 text-white rounded-xl">
                Panel gracza
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-end gap-2 mb-2">
          {user ? (
            <>
              <button onClick={handleLogout} className="text-white text-xs px-2 py-2">
                Wyloguj się {username || '...'}
              </button>
              <Link href="/panel">
                <button className="text-white text-xs px-2 py-2">
                  Panel gracza
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="text-white text-xs px-2 py-2">
                  Zaloguj się
                </button>
              </Link>
              <Link href="/register">
                <button className="text-white text-xs px-2 py-2">
                  Zarejestruj się
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}
            height={0}
            className="w-full max-w-[640px] h-auto"
          />
        </div>
      </div>

      <hr className="w-full border-t border-gray-300 mt-4" />
    </nav>
  )
}
