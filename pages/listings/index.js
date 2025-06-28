import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return {
    props: { products: JSON.parse(JSON.stringify(products)) },
  };
}

export default function ListingsPage({ products }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Motorcycles for Sale</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="text-gray-600">{p.description}</p>
            <p className="text-blue-600 font-bold mt-2">€{p.price}</p>
            <Link href={`/listings/${p.id}`} className="text-sm text-blue-500 underline mt-2 block">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
