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
    <div>
      <h1>My Products</h1>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map(p => (
            <li key={p.id}>
              <strong>{p.title}</strong> - ${p.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
