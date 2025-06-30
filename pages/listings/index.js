// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>
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
            <p className="text-sm text-gray-600 mb-1">Make & Model: {product.makeModel}</p>
            <p className="text-sm text-gray-600 mb-1">Location: {product.location}</p>
            <p className="text-gray-800 font-medium mb-2">€{product.price}</p>
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
