// pages/listings/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Listings() {
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch('/api/listings') // This endpoint should return all listings
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      listings.filter(listing =>
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q)
      )
    );
  }, [search, listings]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Motorcycle Listings</h1>

      <input
        type="text"
        placeholder="Search motorcycles..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded w-full"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(listing => (
          <Link key={listing.id} href={`/listings/${listing.id}`}>
            <div className="border p-4 rounded shadow hover:shadow-md">
              <h2 className="text-xl font-semibold">{listing.title}</h2>
              <p className="text-gray-600 text-sm">{listing.description.slice(0, 80)}...</p>
              <p className="mt-2 font-bold">€{listing.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
