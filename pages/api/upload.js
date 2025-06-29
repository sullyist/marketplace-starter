// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import cloudinary from 'cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    try {
      const result = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: 'marketplace-ads',
      });

      return res.status(200).json({ imageUrl: result.secure_url });
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  });
}
