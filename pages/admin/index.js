// pages/admin/index.js
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/products')
        .then(res => {
          if (res.status === 403) {
            router.push('/'); // redirect if not admin
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setProducts(data);
        });
    }
  }, [status]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    const res = await fetch(`/api/admin/delete/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert('Failed to delete ad.');
    }
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>You must be logged in.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {products.length === 0 ? (
        <p>No ads available.</p>
      ) : (
        <ul className="space-y-4">
          {products.map(product => (
            <li key={product.id} className="border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold">{product.title}</h2>
              <p className="text-sm text-gray-600">€{product.price}</p>
              <p className="text-sm text-gray-600">Posted by: {product.userId}</p>
              <button
                onClick={() => handleDelete(product.id)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
