// components/Navbar.js
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="fixed top-0 w-full bg-white shadow z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          MotoMarket
        </Link>

        <button
          className="md:hidden text-2xl"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          ☰
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-6">
          <Link href="/">Home</Link>
          <Link href="/create">Post Ad</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white shadow"
          >
            <Link href="/" onClick={toggleMenu} className="block">
              Home
            </Link>
            <Link href="/create" onClick={toggleMenu} className="block">
              Post Ad
            </Link>
            <Link href="/dashboard" onClick={toggleMenu} className="block">
              Dashboard
            </Link>
            <Link href="/login" onClick={toggleMenu} className="block">
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
