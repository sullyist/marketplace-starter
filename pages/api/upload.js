import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Formidable error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const imageFile = files.image;
    if (!imageFile || !imageFile.filepath) {
      console.error('❌ File missing or filepath invalid:', imageFile);
      return res.status(400).json({ error: 'Image file missing' });
    }

    try {
      const result = await cloudinary.uploader.upload(imageFile.filepath, {
        folder: 'marketplace_ads', // Optional: organize images in a Cloudinary folder
      });

      return res.status(200).json({ url: result.secure_url });
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: 'Cloudinary upload failed' });
    }
  });
}
