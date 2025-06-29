// pages/api/ads/create.js
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os'; // ✅ Needed for tmpdir

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: os.tmpdir(), // ✅ Use /tmp instead of /var/task/tmp
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form' });

    try {
      const file = files.image;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath);

      // ✅ Save to DB
      const newProduct = await prisma.product.create({
        data: {
          title: fields.title,
          description: fields.description,
          price: parseFloat(fields.price),
          imageUrl: result.secure_url,
          user: {
            connect: { email: fields.email },
          },
        },
      });

      res.status(200).json(newProduct);
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      res.status(500).json({ error: 'Failed to upload image or create ad' });
    }
  });
}
