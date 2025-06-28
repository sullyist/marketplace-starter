import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Layout({ children }) {
  const { data: session } = useSession();

  return (
    <div>
      <nav className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="text-lg font-semibold hover:text-blue-600">Marketplace</a>
          </Link>
          <Link href="/listings">
            <a className="hover:text-blue-600">Listings</a>
          </Link>
          {session && (
            <>
              <Link href="/create">
                <a className="hover:text-blue-600">Create</a>
              </Link>
              <Link href="/dashboard">
                <a className="hover:text-blue-600">Dashboard</a>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!session ? (
            <>
              <Link href="/login">
                <a className="hover:text-blue-600">Login</a>
              </Link>
              <Link href="/register">
                <a className="hover:text-blue-600">Register</a>
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

      <main className="p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
