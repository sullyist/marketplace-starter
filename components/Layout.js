import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Layout({ children }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition">
              MotoMarket
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/listings" className="text-gray-600 hover:text-blue-600 font-medium transition">
                Browse
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-blue-600 font-medium transition">
                Categories
              </Link>
              {session && (
                <>
                  <Link href="/post-ad" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Post Ad
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium transition">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!session ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="hidden md:block text-sm text-gray-500">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
