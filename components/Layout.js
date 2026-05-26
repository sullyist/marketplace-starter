import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!session) {
      setUnread(0);
      return;
    }
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread-count');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnread(data.count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session, router.asPath]);

  // Close menu on route change
  if (typeof window !== 'undefined') {
    router.events?.on('routeChangeStart', closeMenu);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition" onClick={closeMenu}>
            MotoMarket
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/listings" className="text-gray-600 hover:text-blue-600 font-medium transition">Browse</Link>
            <Link href="/categories" className="text-gray-600 hover:text-blue-600 font-medium transition">Categories</Link>
            {session && (
              <>
                <Link href="/post-ad" className="text-gray-600 hover:text-blue-600 font-medium transition">Post Ad</Link>
                <Link href="/messages" className="text-gray-600 hover:text-blue-600 font-medium transition relative inline-flex items-center">
                  Messages
                  {unread > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium transition">Admin</Link>
                )}
              </>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!session ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">Register</Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-500">{session.user.name || session.user.email}</span>
                <button onClick={() => signOut()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-sm">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <Link href="/listings" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Browse</Link>
            <Link href="/categories" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Categories</Link>
            {session && (
              <>
                <Link href="/post-ad" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Post Ad</Link>
                <Link href="/messages" onClick={closeMenu} className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  <span>Messages</span>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Dashboard</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium">Admin</Link>
                )}
              </>
            )}
            <div className="border-t border-gray-100 pt-3 mt-2">
              {!session ? (
                <div className="flex gap-3">
                  <Link href="/login" onClick={closeMenu} className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">Login</Link>
                  <Link href="/register" onClick={closeMenu} className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Register</Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{session.user.name || session.user.email}</span>
                  <button onClick={() => { signOut(); closeMenu(); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-sm">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
