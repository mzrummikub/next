'use client'
import { useState } from 'react'
import Link from "next/link";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Przycisk Hamburger Menu dla telefonów */}
      <button 
        className="sm:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed sm:relative top-0 left-0 h-full text-white p-4 z-40
        transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        sm:translate-x-0 sm:w-64 w-64
      `}>
        <ul className="flex flex-col space-y-4 text-lg mt-12 sm:mt-0">
          {/* HOME */}
          <li>
            <Link href="/">
              <button className="w-full px-4 py-2 bg-blue-500 rounded">Home</button>
            </Link>
          </li>

          {/* LOGOWANIE */}
          <li>
            <Link href="/login">
              <button className="w-full px-4 py-2 bg-blue-500 rounded">Logowanie</button>
            </Link>
          </li>
        </ul>
      </aside>

      {/* Overlay, by zamknąć sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
