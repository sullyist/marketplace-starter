const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const listings = [
  {
    title: '2019 Honda CBR650R',
    make: 'Honda', model: 'CBR650R', year: '2019', mileage: '8200', mileageUnit: 'km',
    condition: 'Excellent', price: 7500, engineSize: '649', power: '95 BHP',
    bikeType: 'Sport', location: 'Dublin', description: 'Immaculate CBR650R in Pearl Glare White. Full service history, new tyres fitted 500km ago. Never dropped, always garaged. Ideal A2 licence bike or experienced rider. Selling due to upgrade.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    title: '2021 Yamaha MT-07',
    make: 'Yamaha', model: 'MT-07', year: '2021', mileage: '5400', mileageUnit: 'km',
    condition: 'Excellent', price: 8200, engineSize: '689', power: '73 BHP',
    bikeType: 'Naked', location: 'Cork', description: 'Stunning MT-07 in Icon Blue. One careful owner, full Yamaha dealer service history. Fitted with Akrapovic slip-on exhaust and tail tidy. MOT until April 2026.',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
  },
  {
    title: '2018 Kawasaki Z900',
    make: 'Kawasaki', model: 'Z900', year: '2018', mileage: '18500', mileageUnit: 'km',
    condition: 'Good', price: 6800, engineSize: '948', power: '125 BHP',
    bikeType: 'Naked', location: 'Galway', description: 'Well maintained Z900 with full service history. Recent major service including valve clearances. Comes with heated grips, centre stand and Givi top box. Minor cosmetic marks consistent with age.',
    imageUrl: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80',
  },
  {
    title: '2020 BMW R 1250 GS Adventure',
    make: 'BMW', model: 'R 1250 GS Adventure', year: '2020', mileage: '22000', mileageUnit: 'km',
    condition: 'Good', price: 16500, engineSize: '1254', power: '136 BHP',
    bikeType: 'Adventure', location: 'Dublin', description: 'The ultimate adventure bike. Spec includes Dynamic Pro, Keyless Ride, heated grips and seat, LED lights and full luggage set. Two owners from new, full BMW dealer service history.',
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  },
  {
    title: '2017 Ducati Monster 821',
    make: 'Ducati', model: 'Monster 821', year: '2017', mileage: '14200', mileageUnit: 'km',
    condition: 'Good', price: 8900, engineSize: '821', power: '109 BHP',
    bikeType: 'Naked', location: 'Limerick', description: 'Iconic Ducati Monster in Ducati Red. Full desmodromic service completed at 12,000km. Termignoni exhaust fitted. Some light scratches on left fairing from a tip over in car park — priced accordingly.',
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
  },
  {
    title: '2022 KTM 890 Duke R',
    make: 'KTM', model: '890 Duke R', year: '2022', mileage: '3100', mileageUnit: 'km',
    condition: 'Excellent', price: 11200, engineSize: '889', power: '121 BHP',
    bikeType: 'Naked', location: 'Waterford', description: 'Nearly new 890 Duke R in Orange. Purchased new in March 2022, barely run in. WP Apex Pro suspension, Supercorsa tyres, quickshifter. Full KTM service history. Reluctant sale.',
    imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80',
  },
  {
    title: '2016 Harley-Davidson Sportster 883',
    make: 'Harley-Davidson', model: 'Sportster 883', year: '2016', mileage: '9800', mileageUnit: 'miles',
    condition: 'Good', price: 6200, engineSize: '883', power: '50 BHP',
    bikeType: 'Cruiser', location: 'Belfast', description: 'Classic Harley Sportster in Vivid Black. Vance & Hines exhaust, custom seat and bars. Garaged all its life. Perfect beginner cruiser or city commuter. Tax and NCT valid.',
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80',
  },
  {
    title: '2019 Triumph Tiger 800 XRT',
    make: 'Triumph', model: 'Tiger 800 XRT', year: '2019', mileage: '16000', mileageUnit: 'km',
    condition: 'Good', price: 9800, engineSize: '800', power: '95 BHP',
    bikeType: 'Adventure', location: 'Kilkenny', description: 'Fully loaded Tiger 800 XRT with heated grips, cruise control, keyless ignition and full Triumph luggage. Regularly serviced at Triumph dealer. Ideal touring machine — selling as switching to bigger GS.',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
  },
  {
    title: '2020 Honda CB500X',
    make: 'Honda', model: 'CB500X', year: '2020', mileage: '6700', mileageUnit: 'km',
    condition: 'Excellent', price: 5400, engineSize: '471', power: '47 BHP',
    bikeType: 'Adventure', location: 'Sligo', description: 'Perfect A2 licence adventure bike. One owner, always dealer serviced. Honda Smart Key system, ABS, and excellent fuel economy. Comes with Honda branded top box and hand guards.',
    imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  },
  {
    title: '2015 Suzuki GSX-R750',
    make: 'Suzuki', model: 'GSX-R750', year: '2015', mileage: '24000', mileageUnit: 'km',
    condition: 'Fair', price: 5200, engineSize: '750', power: '150 BHP',
    bikeType: 'Sport', location: 'Dublin', description: 'The classic GSXR750 in iconic blue/white livery. High mileage but well maintained with full service history. Recent new chain and sprockets, brake pads and tyres. Some cosmetic wear but mechanically sound.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    title: '2023 Royal Enfield Meteor 350',
    make: 'Royal Enfield', model: 'Meteor 350', year: '2023', mileage: '1200', mileageUnit: 'km',
    condition: 'New', price: 4800, engineSize: '349', power: '20 BHP',
    bikeType: 'Cruiser', location: 'Cork', description: 'Brand new Meteor 350 in Fireball Black, only 1,200km since new. Still under factory warranty. Tripper navigation pod fitted. Perfect beginner cruiser with modern reliability.',
    imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80',
  },
  {
    title: '2018 Kawasaki Ninja 400',
    make: 'Kawasaki', model: 'Ninja 400', year: '2018', mileage: '11300', mileageUnit: 'km',
    condition: 'Good', price: 4900, engineSize: '399', power: '45 BHP',
    bikeType: 'Sport', location: 'Galway', description: 'Brilliant A2 sport bike. Full service history, never dropped. Aftermarket levers and bar end mirrors. Fast on a budget — won Motorcycle News best A2 bike two years running.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
];

async function main() {
  // Check if seed user exists
  let seller = await prisma.user.findUnique({ where: { email: 'demo@motomarket.ie' } });

  if (!seller) {
    const password = await bcrypt.hash('Demo1234!', 10);
    seller = await prisma.user.create({
      data: { name: 'MotoMarket Demo', email: 'demo@motomarket.ie', password, role: 'buyer' },
    });
    console.log('Created demo seller user');
  }

  let created = 0;
  for (const listing of listings) {
    // Skip if already exists by title + userId
    const existing = await prisma.product.findFirst({
      where: { title: listing.title, userId: seller.id },
    });
    if (existing) { console.log(`Skipping existing: ${listing.title}`); continue; }

    await prisma.product.create({
      data: { ...listing, makeModel: `${listing.make} ${listing.model}`, userId: seller.id },
    });
    created++;
    console.log(`Created: ${listing.title}`);
  }

  console.log(`\nDone — ${created} listings created.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
