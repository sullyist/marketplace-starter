// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { query } = context;
  const filters = {};

  if (query.keyword) {
    filters.OR = [
      { title: { contains: query.keyword, mode: 'insensitive' } },
      { description: { contains: query.keyword, mode: 'insensitive' } },
    ];
  }
  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) filters.price.lte = parseFloat(query.maxPrice);
  }
  if (query.location) {
    filters.location = { contains: query.location, mode: 'insensitive' };
  }

  const products = await prisma.product.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      initialProducts: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default function Listings({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleFilter = async () => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (location) params.append('location', location);

    const res = await fetch(`/listings?${params.toString()}`);
    const html = await res.text();
    const match = html.match(/__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (match) {
      const data = JSON.parse(decodeURIComponent(match[1]));
      setProducts(data.props.pageProps.initialProducts);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>
      <button
        onClick={handleFilter}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Apply Filters
      </button>

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
            <Link
              href={`/listings/${product.id}`}
              className="text-blue-600 hover:underline"
            >
              View details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
