import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const product = await prisma.product.findUnique({
    where: { id: context.params.id },
    include: { user: true },
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product: JSON.parse(JSON.stringify(product)) },
  };
}

export default function ListingDetail({ product }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="text-blue-600 font-semibold mt-4">Price: €{product.price}</p>
      <p className="text-sm mt-2 text-gray-500">Posted by: {product.user.name || product.user.email}</p>
    </div>
  );
}
