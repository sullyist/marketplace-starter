// pages/api/ads/create.js
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), '/tmp');
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parse error:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.image?.[0] || files.image;

    if (!file || !file.filepath) {
      console.error('❌ No valid file uploaded. File object:', file);
      return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'marketplace-ads',
      });

      // Create product entry in database
      const newProduct = await prisma.product.create({
        data: {
          title: fields.title?.[0] || fields.title,
          description: fields.description?.[0] || fields.description,
          price: parseFloat(fields.price?.[0] || fields.price),
          imageUrl: result.secure_url,
          user: {
            connect: { email: fields.email?.[0] || fields.email },
          },
        },
      });

      res.status(200).json(newProduct);
    } catch (error) {
      console.error('❌ Cloudinary upload or DB insert error:', error);
      res.status(500).json({ error: 'Failed to upload image or save ad' });
    }
  });
}
