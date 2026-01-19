import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ChatBot from './ChatBot';

export default function Layout({ children }) {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div>
      <nav className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-semibold hover:text-blue-600">
            Starting Grid
          </Link>
          <Link href="/listings" className="hover:text-blue-600">
            Listings
          </Link>
          <Link href="/categories" className="hover:text-blue-600">
            Categories
          </Link>
          {session && (
            <>
              <Link href="/post-ad" className="hover:text-blue-600">
                Post Ad
              </Link>
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="hover:text-red-600 font-medium">
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!session ? (
            <>
              <Link href="/login" className="hover:text-blue-600">
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-600">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">Hello, {session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="p-6 max-w-4xl mx-auto">
        {children}
        <ChatBot />
      </main>
    </div>
  );
}
