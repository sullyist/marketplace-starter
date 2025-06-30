// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const prisma = new PrismaClient();

export async function getServerSideProps({ query }) {
  const filters = {};

  if (query.q) {
    filters.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.location) {
    filters.location = { contains: query.location, mode: 'insensitive' };
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) filters.price.lte = parseFloat(query.maxPrice);
  }

  const products = await prisma.product.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default function Listings({ products }) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: router.query.q || '',
    location: router.query.location || '',
    minPrice: router.query.minPrice || '',
    maxPrice: router.query.maxPrice || '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = Object.entries(filters)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    router.push(`/listings?${query}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>

      <div className="bg-white shadow-sm rounded p-4 mb-6">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Keyword</label>
            <input
              type="text"
              name="q"
              value={filters.q}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Min Price (€)</label>
            <input
              type="number"
              step="0.01"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Max Price (€)</label>
            <input
              type="number"
              step="0.01"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-4 text-right">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Search
            </button>
            <Link href="/listings">
              <a className="ml-4 text-sm text-blue-600 hover:underline">Reset filters</a>
            </Link>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded shadow-sm p-4">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-gray-600 mb-2">€{product.price}</p>
            <p className="text-sm text-gray-600">Location: {product.location}</p>
            <Link href={`/listings/${product.id}`}>
              <a className="text-blue-600 hover:underline">View details</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
