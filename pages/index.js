import { useEffect, useState } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛒 Marketplace</h1>
      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '250px' }}>
            <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: 'auto' }} />
            <h3>{p.title}</h3>
            <p><strong>${p.price}</strong></p>
            <p>{p.description}</p>
            <p style={{ fontSize: '0.85em', color: '#666' }}>
              Seller: {p.user?.name || p.user?.email || 'Unknown'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
