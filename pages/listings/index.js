// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { query } = context;
  const { keyword = '', minPrice = 0, maxPrice = 100000, location = '' } = query;

  const products = await prisma.product.findMany({
    where: {
      title: { contains: keyword, mode: 'insensitive' },
      price: { gte: Number(minPrice), lte: Number(maxPrice) },
      location: { contains: location, mode: 'insensitive' },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      query,
    },
  };
}

export default function Listings({ products, query }) {
  const [keyword, setKeyword] = useState(query.keyword || '');
  const [minPrice, setMinPrice] = useState(query.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(query.maxPrice || '');
  const [location, setLocation] = useState(query.location || '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Motorcycle Listings</h1>

      <form method="GET" className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Keyword</label>
          <div className="relative">
            <input
              name="keyword"
              type="text"
              placeholder="Search titles"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border rounded pl-10 pr-3 py-2"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="relative">
            <input
              name="location"
              type="text"
              placeholder="e.g. Dublin"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded pl-10 pr-3 py-2"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Min (€)</label>
            <input
              name="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max (€)</label>
            <input
              name="maxPrice"
              type="number"
              placeholder="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filter
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="border rounded shadow hover:shadow-lg transition p-4 bg-white">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-xl font-semibold mb-1">{product.title}</h2>
              <p className="text-gray-700 font-medium mb-1">€{product.price}</p>
              <p className="text-sm text-gray-500 mb-2">📍 {product.location}</p>
              <Link href={`/listings/${product.id}`}>
                <a className="text-blue-600 hover:underline text-sm">View details</a>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">No matching ads found.</p>
        )}
      </div>
    </div>
  );
}
