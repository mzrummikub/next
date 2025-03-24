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
  // MUSI BYĆ:
  const [user, setUser] = useState(null)  // <-- Deklaracja stanu user
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // (Opcjonalnie) useEffect, żeby pobrać aktualnego usera
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="w-full px-4 py-2">
      {/* SEKCJA MOBILNA */}
      <div className="sm:hidden flex flex-col w-full">
        {/* RZĄD 1: Ikony po lewej / Hamburger po prawej */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
           
            {user ? (
              <button
                onClick={handleLogout}
                className=" text-white text-xs px-2 py-2"
              >
                Wyloguj się
              </button>
            ) : (
              <Link href="/login">
                <button className=" text-white text-xs px-2 py-2">
                  Zaloguj się
                </button>
              </Link>
            )}
            <Link href="/register">
              <button className=" text-white text-xs px-2 py-2">
                Zarejestruj się
              </button>
            </Link>
            <Link href="/panel">
              <button className=" text-white text-xs px-2 py-2">
                Panel klienta
              </button>
            </Link>
          </div>

          {/* PRAWY RÓG: Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-2xl text-white p-2 rounded"
          >
            ☰
          </button>
        </div>

        {/* RZĄD 2: Logo wyśrodkowane */}
        <div className="flex justify-center my-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}
            height={0}
            className="w-full max-w-[640px] h-auto"
          />
        </div>

        {/* MENU PO OTWARCIU (opcjonalnie możesz coś dodać) */}
        {isMenuOpen && (
          <div className="w-auto mt-2 flex flex-col items-center space-y-2">
            {/* Przykładowe rozwijane linki, jeśli chcesz je mieć */}
            <Link href="/">
              <button className="w-60 px-2 py-2 bg-blue-600 text-white rounded-xl">
                Home
              </button>
            </Link>
            <Link href="/inne">
              <button className="w-60 px-2 py-2 bg-blue-600 text-white rounded-xl">
                Inne
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* SEKCJA DESKTOPOWA */}
      <div className="hidden sm:block">
        {/* Wiersz z przyciskami */}
        <div className="flex items-center justify-end gap-2 mb-2">
          {user ? (
            <button
              onClick={handleLogout}
              className=" text-white text-xs px-2 py-2"
            >
              Wyloguj się
            </button>
          ) : (
            <Link href="/login">
              <button className=" text-white text-xs px-2 py-2">
                Zaloguj się
              </button>
            </Link>
          )}

          <Link href="/register">
            <button className=" text-white text-xs px-2 py-2">
              Zarejestruj się
            </button>
          </Link>
          <Link href="/panel">
            <button className=" text-white text-xs px-2 py-2">
              Panel klienta
            </button>
          </Link>
        </div>

        {/* 2) Logo */}
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
