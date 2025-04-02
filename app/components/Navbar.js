"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import '@/styles/globals.css';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";



export function Navbar() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter(); // Inicjalizacja routera

  // Funkcja obsługująca wylogowanie
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Przekierowanie do strony głównej po wylogowaniu
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Używamy tabeli "users" i pobieramy kolumnę "login"
        const { data, error } = await supabase
          .from('users')
          .select('login')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Błąd przy pobieraniu login z tabeli users:', error);
        } else {
          setLogin(data.login);
        }
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from('users')
          .select('login')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error) setLogin(data.login);
          });
      } else {
        setLogin(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav>
      {/* MOBILE */}
      <div className="sm:hidden flex flex-col w-full">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button onClick={handleLogout} className="text-white text-md px-2 py-2">
                  Wyloguj: {login || '...'}
                </button>
                <Link href="/panel">
                  <button className="text-white text-md px-2 py-2">
                    Panel gracza
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-white text-md px-2 py-2">
                    Zaloguj się
                  </button>
                </Link>
                <Link href="/register">
                  <button className="text-white text-md px-2 py-2">
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

        <div className="flex justify-center my-1 ">
          <Image
            src="/logo.png"
            alt="Logo"
            width={640}
            height={0}
            priority
            className="w-full max-w-[640px] h-auto p-2"
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
            <Link href="/">
              <button className="w-60 px-2 py-2 bg-blue-600 text-white rounded-xl">
                Hom
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
              <button onClick={handleLogout} className="text-white text-md px-2 py-2">
                Wyloguj: {login || '...'}
              </button>
              <Link href="/panel">
                <button className="text-white text-md px-2 py-2">
                  Panel gracza
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="text-white text-md px-2 py-2">
                  Zaloguj się
                </button>
              </Link>
              <Link href="/register">
                <button className="text-white text-md px-2 py-2">
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
            priority
            className="w-full max-w-[640px] h-auto"
          />
        </div>
      </div>

      <hr className="w-full border-t border-gray-300 mt-4" />
    </nav>
  );
}
