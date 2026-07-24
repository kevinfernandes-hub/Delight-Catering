import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding image assets...');

  // 1. Initial Image Assets for sections
  const assets = [
    {
      key: 'hero_bg',
      url: '', // Empty means fall back to CSS radial-gradient mesh background
      title: 'Hero Background Image'
    },
    {
      key: 'hero_video',
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      title: 'Hero Background Video / Showreel'
    },
    {
      key: 'about_plating',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
      title: 'About - Plating Image'
    },
    {
      key: 'package_snacks',
      url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&q=80&w=800',
      title: 'Menu Card - Snacks & Starters'
    },
    {
      key: 'package_biryani',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
      title: 'Menu Card - Signature Biryani'
    },
    {
      key: 'package_buffet',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      title: 'Menu Card - Buffet Service'
    }
  ];

  for (const asset of assets) {
    await prisma.imageAsset.upsert({
      where: { key: asset.key },
      update: {}, // Preserve existing user-uploaded URLs in database
      create: asset
    });
  }

  // 2. Initial Gallery Images
  const gallery = [
    {
      url: 'https://lh3.googleusercontent.com/p/AF1QipPY7mz7wLX4F_qfb9VQS7ZaoVzZIR43m6Yzxd6g=s1360-w1360-h1020-rw',
      title: 'Event Setup'
    },
    {
      url: 'https://lh3.googleusercontent.com/p/AF1QipNRyHectAfidbNfRxSKHi05AhGT5_abQFIlRjc1=s1360-w1360-h1020-rw',
      title: 'Delicious Spread'
    },
    {
      url: 'https://lh3.googleusercontent.com/p/AF1QipPlhuAniiG_FcL4lsB-xTBgLgn_LRxX-zrZZfjV=s1360-w1360-h1020-rw',
      title: 'Professional Service'
    },
    {
      url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600',
      title: 'Elegant Presentation'
    },
    {
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      title: 'Fresh Cuisine'
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&q=80&w=600',
      title: 'Happy Guests'
    }
  ];

  // Seed gallery if empty
  const currentCount = await prisma.galleryImage.count();
  if (currentCount === 0) {
    console.log('Seeding default gallery images...');
    for (const item of gallery) {
      await prisma.galleryImage.create({ data: item });
    }
  }

  console.log('Image seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
