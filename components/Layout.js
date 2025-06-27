// components/Layout.js
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Layout({ children }) {
  const { data: session } = useSession();

  return (
    <div>
      <nav style={{ padding: 16, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <Link href="/" style={{ marginRight: 10 }}>Home</Link>
        {session && (
          <>
            <Link href="/create" style={{ marginRight: 10 }}>Create</Link>
            <Link href="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
          </>
        )}
        {!session ? (
          <>
            <Link href="/login" style={{ marginRight: 10 }}>Login</Link>
            <Link href="/register">Register</Link>
          </>
        ) : (
          <>
            <span style={{ marginLeft: 10 }}>Hello, {session.user.email}</span>
            <button onClick={() => signOut()} style={{ marginLeft: 10 }}>Logout</button>
          </>
        )}
      </nav>

      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}
