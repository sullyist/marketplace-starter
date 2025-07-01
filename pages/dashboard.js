import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);

  useEffect(() => {
  if (session?.user?.id) {
    fetch(`/api/products/user/${session.user.id}`)
      .then(res => res.json())
      .then(setProducts);
    }
  }, [session]);

  if (!session) {
    return <p>You must be logged in to view your dashboard. <a href="/login">Login</a></p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Ads</h1>
      {products.length === 0 ? (
        <p>No ads posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => (
            <li key={p.id} className="border p-4 rounded shadow">
              <strong>{p.title}</strong> - €{p.price}
              <div className="text-sm text-gray-600">{p.location}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
