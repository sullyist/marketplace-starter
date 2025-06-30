// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { keyword = '', location = '', minPrice = '', maxPrice = '' } = context.query;

  const filters = {
    AND: [
      keyword ? { title: { contains: keyword, mode: 'insensitive' } } : {},
      location ? { location: { contains: location, mode: 'insensitive' } } : {},
      minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
      maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
    ],
  };

  const products = await prisma.product.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      initialFilters: { keyword, location, minPrice, maxPrice },
    },
  };
}

export default function Listings({ products, initialFilters }) {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const query = new URLSearchParams(filters).toString();
    window.location.href = `/listings?${query}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          name="keyword"
          type="text"
          placeholder="Keyword"
          value={filters.keyword}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          name="location"
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          name="minPrice"
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          name="maxPrice"
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={applyFilters}
          className="md:col-span-4 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-gray-500 col-span-full">No listings found.</p>
        ) : (
          products.map((product) => (
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
              <Link href={`/listings/${product.id}`} className="text-blue-600 hover:underline">
                View details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
