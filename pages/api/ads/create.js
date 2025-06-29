// pages/api/ads/create.js
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
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

  const uploadDir = os.tmpdir();

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parsing error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    try {
      const file = files.image;
      if (!file || !file.filepath) {
        console.error('❌ No valid file found:', file);
        return res.status(400).json({ error: 'Image file missing or invalid' });
      }

      // Log file path for debugging
      console.log('📸 Uploading file from:', file.filepath);

      const result = await cloudinary.uploader.upload(file.filepath);

      console.log('✅ Cloudinary result:', result);

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

      return res.status(200).json(newProduct);
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image or create ad' });
    }
  });
}
