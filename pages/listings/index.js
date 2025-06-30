// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { MapPin, DollarSign } from 'lucide-react';

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}

export default function Listings({ products }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Motorcycle Listings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="backdrop-blur-md bg-white/60 border border-white/30 dark:bg-gray-800/60 dark:border-gray-700 rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm mb-1">
                <DollarSign className="w-4 h-4 mr-1" /> €{product.price}
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm mb-3">
                <MapPin className="w-4 h-4 mr-1" /> {product.location}
              </div>
              <Link
                href={`/listings/${product.id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
