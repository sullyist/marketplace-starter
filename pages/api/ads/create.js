// pages/api/ads/create.js
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: path.join(process.cwd(), '/tmp'),
  });

  await fs.mkdir(form.uploadDir, { recursive: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    try {
      const file = files.image;
      if (!file || !file.filepath) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const uploadResult = await cloudinary.uploader.upload(file.filepath, {
        folder: 'marketplace-ads',
      });

      const newAd = await prisma.product.create({
        data: {
          title: fields.title,
          description: fields.description,
          price: parseFloat(fields.price),
          imageUrl: uploadResult.secure_url,
          user: {
            connect: { email: fields.email },
          },
        },
      });

      res.status(200).json(newAd);
    } catch (error) {
      console.error('❌ Upload or DB error:', error);
      res.status(500).json({ error: 'Ad creation failed' });
    }
  });
}
