const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const sellers = [
  {
    key: 'demo',
    name: 'MotoMarket Demo',
    email: 'demo@motomarket.ie',
    role: 'buyer',
    dealerUntilDays: null,
  },
  {
    key: 'dublin',
    name: 'Dublin Moto Centre',
    email: 'sales@dublinmoto.ie',
    role: 'buyer',
    dealerUntilDays: 30,
  },
  {
    key: 'munster',
    name: 'Munster Motorcycle Co',
    email: 'hello@munstermoto.ie',
    role: 'buyer',
    dealerUntilDays: 30,
  },
  {
    key: 'john',
    name: 'John O’Brien',
    email: 'john.obrien.seed@motomarket.ie',
    role: 'buyer',
    dealerUntilDays: null,
  },
  {
    key: 'aoife',
    name: 'Aoife Walsh',
    email: 'aoife.walsh.seed@motomarket.ie',
    role: 'buyer',
    dealerUntilDays: null,
  },
];

const listings = [
  // --- original 12 (owned by demo seller for backward-compat) ---
  { seller: 'demo', title: '2019 Honda CBR650R', make: 'Honda', model: 'CBR650R', year: '2019', mileage: '8200', mileageUnit: 'km', condition: 'Excellent', price: 7500, engineSize: '649', power: '95 BHP', bikeType: 'Sport', location: 'Dublin', description: 'Immaculate CBR650R in Pearl Glare White. Full service history, new tyres fitted 500km ago. Never dropped, always garaged. Ideal A2 licence bike or experienced rider. Selling due to upgrade.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { seller: 'demo', title: '2021 Yamaha MT-07', make: 'Yamaha', model: 'MT-07', year: '2021', mileage: '5400', mileageUnit: 'km', condition: 'Excellent', price: 8200, engineSize: '689', power: '73 BHP', bikeType: 'Naked', location: 'Cork', description: 'Stunning MT-07 in Icon Blue. One careful owner, full Yamaha dealer service history. Fitted with Akrapovic slip-on exhaust and tail tidy. MOT until April 2026.', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
  { seller: 'demo', title: '2018 Kawasaki Z900', make: 'Kawasaki', model: 'Z900', year: '2018', mileage: '18500', mileageUnit: 'km', condition: 'Good', price: 6800, engineSize: '948', power: '125 BHP', bikeType: 'Naked', location: 'Galway', description: 'Well maintained Z900 with full service history. Recent major service including valve clearances. Comes with heated grips, centre stand and Givi top box. Minor cosmetic marks consistent with age.', imageUrl: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80' },
  { seller: 'demo', title: '2020 BMW R 1250 GS Adventure', make: 'BMW', model: 'R 1250 GS Adventure', year: '2020', mileage: '22000', mileageUnit: 'km', condition: 'Good', price: 16500, engineSize: '1254', power: '136 BHP', bikeType: 'Adventure', location: 'Dublin', description: 'The ultimate adventure bike. Spec includes Dynamic Pro, Keyless Ride, heated grips and seat, LED lights and full luggage set. Two owners from new, full BMW dealer service history.', imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
  { seller: 'demo', title: '2017 Ducati Monster 821', make: 'Ducati', model: 'Monster 821', year: '2017', mileage: '14200', mileageUnit: 'km', condition: 'Good', price: 8900, engineSize: '821', power: '109 BHP', bikeType: 'Naked', location: 'Limerick', description: 'Iconic Ducati Monster in Ducati Red. Full desmodromic service completed at 12,000km. Termignoni exhaust fitted. Some light scratches on left fairing from a tip over in car park — priced accordingly.', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80' },
  { seller: 'demo', title: '2022 KTM 890 Duke R', make: 'KTM', model: '890 Duke R', year: '2022', mileage: '3100', mileageUnit: 'km', condition: 'Excellent', price: 11200, engineSize: '889', power: '121 BHP', bikeType: 'Naked', location: 'Waterford', description: 'Nearly new 890 Duke R in Orange. Purchased new in March 2022, barely run in. WP Apex Pro suspension, Supercorsa tyres, quickshifter. Full KTM service history. Reluctant sale.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },
  { seller: 'demo', title: '2016 Harley-Davidson Sportster 883', make: 'Harley-Davidson', model: 'Sportster 883', year: '2016', mileage: '9800', mileageUnit: 'miles', condition: 'Good', price: 6200, engineSize: '883', power: '50 BHP', bikeType: 'Cruiser', location: 'Belfast', description: 'Classic Harley Sportster in Vivid Black. Vance & Hines exhaust, custom seat and bars. Garaged all its life. Perfect beginner cruiser or city commuter. Tax and NCT valid.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80' },
  { seller: 'demo', title: '2019 Triumph Tiger 800 XRT', make: 'Triumph', model: 'Tiger 800 XRT', year: '2019', mileage: '16000', mileageUnit: 'km', condition: 'Good', price: 9800, engineSize: '800', power: '95 BHP', bikeType: 'Adventure', location: 'Kilkenny', description: 'Fully loaded Tiger 800 XRT with heated grips, cruise control, keyless ignition and full Triumph luggage. Regularly serviced at Triumph dealer. Ideal touring machine — selling as switching to bigger GS.', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
  { seller: 'demo', title: '2020 Honda CB500X', make: 'Honda', model: 'CB500X', year: '2020', mileage: '6700', mileageUnit: 'km', condition: 'Excellent', price: 5400, engineSize: '471', power: '47 BHP', bikeType: 'Adventure', location: 'Sligo', description: 'Perfect A2 licence adventure bike. One owner, always dealer serviced. Honda Smart Key system, ABS, and excellent fuel economy. Comes with Honda branded top box and hand guards.', imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
  { seller: 'demo', title: '2015 Suzuki GSX-R750', make: 'Suzuki', model: 'GSX-R750', year: '2015', mileage: '24000', mileageUnit: 'km', condition: 'Fair', price: 5200, engineSize: '750', power: '150 BHP', bikeType: 'Sport', location: 'Dublin', description: 'The classic GSXR750 in iconic blue/white livery. High mileage but well maintained with full service history. Recent new chain and sprockets, brake pads and tyres. Some cosmetic wear but mechanically sound.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { seller: 'demo', title: '2023 Royal Enfield Meteor 350', make: 'Royal Enfield', model: 'Meteor 350', year: '2023', mileage: '1200', mileageUnit: 'km', condition: 'New', price: 4800, engineSize: '349', power: '20 BHP', bikeType: 'Cruiser', location: 'Cork', description: 'Brand new Meteor 350 in Fireball Black, only 1,200km since new. Still under factory warranty. Tripper navigation pod fitted. Perfect beginner cruiser with modern reliability.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80' },
  { seller: 'demo', title: '2018 Kawasaki Ninja 400', make: 'Kawasaki', model: 'Ninja 400', year: '2018', mileage: '11300', mileageUnit: 'km', condition: 'Good', price: 4900, engineSize: '399', power: '45 BHP', bikeType: 'Sport', location: 'Galway', description: 'Brilliant A2 sport bike. Full service history, never dropped. Aftermarket levers and bar end mirrors. Fast on a budget — won Motorcycle News best A2 bike two years running.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },

  // --- Dublin Moto Centre (dealer) ---
  { seller: 'dublin', title: '2024 BMW M 1000 RR', make: 'BMW', model: 'M 1000 RR', year: '2024', mileage: '950', mileageUnit: 'km', condition: 'New', price: 32500, engineSize: '999', power: '212 BHP', bikeType: 'Sport', location: 'Dublin', description: 'Ex-demo M 1000 RR with the full M package. Carbon wheels, winglets, DTC, Pro Shift, and launch control. Delivery mileage only. Finance and trade-in welcome. 12-month warranty included.', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80', featuredDays: 7 },
  { seller: 'dublin', title: '2022 Ducati Streetfighter V4', make: 'Ducati', model: 'Streetfighter V4', year: '2022', mileage: '4600', mileageUnit: 'km', condition: 'Excellent', price: 19800, engineSize: '1103', power: '208 BHP', bikeType: 'Streetfighter', location: 'Dublin', description: 'The Fight Formula. Immaculate Streetfighter V4 in Ducati Red with full carbon pack. Akrapovic titanium system, Ohlins electronic suspension. Fully serviced, ready to ride.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },
  { seller: 'dublin', title: '2023 BMW R 1250 RT', make: 'BMW', model: 'R 1250 RT', year: '2023', mileage: '8900', mileageUnit: 'km', condition: 'Excellent', price: 21500, engineSize: '1254', power: '136 BHP', bikeType: 'Touring', location: 'Dublin', description: 'Flagship tourer with Dynamic ESA, Comfort Package, Touring Package. Heated grips & seats, cruise, hill hold, keyless ride. Full BMW luggage set. Perfect for long distance.', imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
  { seller: 'dublin', title: '2020 Honda CRF1100L Africa Twin', make: 'Honda', model: 'CRF1100L Africa Twin', year: '2020', mileage: '19200', mileageUnit: 'km', condition: 'Good', price: 12200, engineSize: '1084', power: '101 BHP', bikeType: 'Adventure', location: 'Dublin', description: 'DCT variant with Adventure Sports touring pack. Crash bars, bash plate, heated grips and full aluminium panniers. Dealer serviced from new. Ready to ride anywhere.', imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80', featuredDays: 5 },
  { seller: 'dublin', title: '2021 Kawasaki Ninja 1000SX', make: 'Kawasaki', model: 'Ninja 1000SX', year: '2021', mileage: '10400', mileageUnit: 'km', condition: 'Excellent', price: 11400, engineSize: '1043', power: '140 BHP', bikeType: 'Sport Tourer', location: 'Dublin', description: 'The all-rounder. Tourer / Performance pack with full Kawasaki panniers, heated grips, Akrapovic silencer. Smooth inline four, long range tank. Dealer serviced, 12-month warranty.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { seller: 'dublin', title: '2019 Indian Scout Bobber', make: 'Indian', model: 'Scout Bobber', year: '2019', mileage: '7800', mileageUnit: 'miles', condition: 'Excellent', price: 11800, engineSize: '1133', power: '100 BHP', bikeType: 'Bobber', location: 'Dublin', description: 'Moody matte black Scout Bobber. Low-slung aggressive stance, Vance & Hines pipes, chopped mudguards. V-twin thump with modern reliability. HPI clear, two keys.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80' },
  { seller: 'dublin', title: '2022 Yamaha Tracer 9 GT', make: 'Yamaha', model: 'Tracer 9 GT', year: '2022', mileage: '9200', mileageUnit: 'km', condition: 'Excellent', price: 11900, engineSize: '890', power: '117 BHP', bikeType: 'Sport Tourer', location: 'Dublin', description: 'Fully kitted Tracer 9 GT with semi-active suspension, quickshifter, cruise, heated grips, full OEM side cases. Full Yamaha service history. One owner, HPI clear.', imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
  { seller: 'dublin', title: '2023 Zero SR/F', make: 'Zero', model: 'SR/F', year: '2023', mileage: '2100', mileageUnit: 'km', condition: 'Excellent', price: 18900, engineSize: 'Electric', power: '110 BHP', bikeType: 'Electric', location: 'Dublin', description: 'Electric performance. 200+ km range, 200 Nm instant torque. Zero maintenance beyond tyres and brakes. Premium trim with heated grips, parking mode, fast charging support.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },

  // --- Munster Motorcycle Co (dealer) ---
  { seller: 'munster', title: '2021 Honda PCX125', make: 'Honda', model: 'PCX125', year: '2021', mileage: '4200', mileageUnit: 'km', condition: 'Excellent', price: 2800, engineSize: '125', power: '12 BHP', bikeType: 'Moped', location: 'Cork', description: 'City runabout perfection. Honda reliability, Smart Key, idle stop, excellent fuel economy. New tyres and battery. Ready to ride, tax and warranty included.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80' },
  { seller: 'munster', title: '2022 Vespa GTS 300 HPE', make: 'Vespa', model: 'GTS 300 HPE', year: '2022', mileage: '3600', mileageUnit: 'km', condition: 'Excellent', price: 6400, engineSize: '278', power: '24 BHP', bikeType: 'Scooter', location: 'Cork', description: 'Iconic Vespa GTS in Beige Avvolgente. ABS, ASR traction control, LED lights throughout. Keyless. Includes topbox and chrome accessories. Showroom condition.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80', featuredDays: 4 },
  { seller: 'munster', title: '2019 Suzuki V-Strom 650 XT', make: 'Suzuki', model: 'V-Strom 650 XT', year: '2019', mileage: '13700', mileageUnit: 'km', condition: 'Good', price: 6900, engineSize: '645', power: '70 BHP', bikeType: 'Dual-Sport', location: 'Limerick', description: 'Reliable V-Strom with spoked wheels, hand guards, SW-Motech crash bars. Tall screen, centre stand. Perfect commuter or weekend tourer. Dealer serviced.', imageUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80' },
  { seller: 'munster', title: '2020 Triumph Street Twin', make: 'Triumph', model: 'Street Twin', year: '2020', mileage: '7100', mileageUnit: 'km', condition: 'Excellent', price: 7800, engineSize: '900', power: '65 BHP', bikeType: 'Classic', location: 'Cork', description: 'Timeless Modern Classic in Jet Black. Vance & Hines upswept pipes, bar end mirrors, bench seat. A2 compatible with restrictor kit. Authentic retro cool with Triumph reliability.', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80' },
  { seller: 'munster', title: '2017 Harley-Davidson Fat Bob', make: 'Harley-Davidson', model: 'Fat Bob', year: '2017', mileage: '12400', mileageUnit: 'miles', condition: 'Good', price: 10800, engineSize: '1746', power: '79 BHP', bikeType: 'Bobber', location: 'Cork', description: 'Milwaukee-Eight Fat Bob in Black Denim. Fat front tyre, aggressive stance. Screamin’ Eagle Stage 1 kit with Vance & Hines pipes. Full dealer service history.', imageUrl: 'https://images.unsplash.com/photo-1558981852-426c349a7f0a?w=800&q=80' },
  { seller: 'munster', title: '2015 Honda CB1100 EX', make: 'Honda', model: 'CB1100 EX', year: '2015', mileage: '22500', mileageUnit: 'km', condition: 'Good', price: 6900, engineSize: '1140', power: '89 BHP', bikeType: 'Classic', location: 'Waterford', description: 'Air-cooled four-cylinder beauty. Chrome tank, wire wheels, twin clocks. Collector condition — garaged, polished, loved. One for the connoisseur.', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80' },
  { seller: 'munster', title: '2022 Royal Enfield Interceptor 650', make: 'Royal Enfield', model: 'Interceptor 650', year: '2022', mileage: '5800', mileageUnit: 'km', condition: 'Excellent', price: 5900, engineSize: '648', power: '47 BHP', bikeType: 'Classic', location: 'Limerick', description: 'Parallel twin in Baker Express yellow. S&S pipes, bar end mirrors, bench seat. A2 compatible. Modern reliability in a 60s wrapper. Warranty remaining.', imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80' },

  // --- John O'Brien (private seller) ---
  { seller: 'john', title: '2019 Husqvarna 701 Supermoto', make: 'Husqvarna', model: '701 Supermoto', year: '2019', mileage: '8400', mileageUnit: 'km', condition: 'Good', price: 7400, engineSize: '693', power: '74 BHP', bikeType: 'Supermoto', location: 'Wicklow', description: 'Supermoto hooligan. Akrapovic full system, Rekluse clutch, chopped tail, bar risers. Mad fun on the back roads of Wicklow. Recent valve check and new rear tyre.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },
  { seller: 'john', title: '2018 KTM 500 EXC-F', make: 'KTM', model: '500 EXC-F', year: '2018', mileage: '280', mileageUnit: 'hours', condition: 'Good', price: 5800, engineSize: '510', power: '63 BHP', bikeType: 'Enduro', location: 'Wicklow', description: 'Road-legal enduro weapon. Rebuilt top end 30 hours ago, new graphics, bar pads and grips. Rekluse clutch. Perfect for green laning and the Dublin/Wicklow mountains.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },
  { seller: 'john', title: '2022 Yamaha YZ250F', make: 'Yamaha', model: 'YZ250F', year: '2022', mileage: '45', mileageUnit: 'hours', condition: 'Excellent', price: 7200, engineSize: '250', power: '45 BHP', bikeType: 'Dirt Bike', location: 'Kildare', description: 'Hardly used MX bike. Only 45 hours, all services done. New top end at 40 hours. Comes with spare wheels, pit stand, starter and a box of spares.', imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&q=80' },

  // --- Aoife Walsh (private seller) ---
  { seller: 'aoife', title: '2020 Yamaha MT-03', make: 'Yamaha', model: 'MT-03', year: '2020', mileage: '6800', mileageUnit: 'km', condition: 'Excellent', price: 4600, engineSize: '321', power: '42 BHP', bikeType: 'Naked', location: 'Meath', description: 'My first big bike, selling as moving abroad. One lady owner, always garaged, full Yamaha service history. A2 licence compatible. Perfect for a new rider.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { seller: 'aoife', title: '2017 Honda Grom 125', make: 'Honda', model: 'Grom 125', year: '2017', mileage: '9400', mileageUnit: 'km', condition: 'Good', price: 2700, engineSize: '125', power: '9 BHP', bikeType: 'Standard', location: 'Dublin', description: 'Little pocket rocket Grom in Pearl Glare White. So much fun for the city. Full service history, new tyres. Bulletproof Honda reliability.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
];

async function main() {
  const sellerMap = {};

  for (const s of sellers) {
    let user = await prisma.user.findUnique({ where: { email: s.email } });
    if (!user) {
      const password = await bcrypt.hash('Demo1234!', 10);
      user = await prisma.user.create({
        data: { name: s.name, email: s.email, password, role: s.role },
      });
      console.log(`Created seller: ${s.name}`);
    }
    if (s.dealerUntilDays) {
      const target = new Date(Date.now() + s.dealerUntilDays * 24 * 60 * 60 * 1000);
      if (!user.dealerUntil || user.dealerUntil < target) {
        await prisma.user.update({
          where: { id: user.id },
          data: { dealerUntil: target },
        });
        console.log(`  → set dealerUntil +${s.dealerUntilDays}d`);
      }
    }
    sellerMap[s.key] = user;
  }

  let created = 0;
  for (const listing of listings) {
    const seller = sellerMap[listing.seller];
    if (!seller) {
      console.warn(`Skipping ${listing.title}: unknown seller ${listing.seller}`);
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { title: listing.title, userId: seller.id },
    });
    if (existing) { console.log(`Skipping existing: ${listing.title}`); continue; }

    const { seller: _s, featuredDays, ...data } = listing;
    await prisma.product.create({
      data: {
        ...data,
        makeModel: `${listing.make} ${listing.model}`,
        userId: seller.id,
        featuredUntil: featuredDays
          ? new Date(Date.now() + featuredDays * 24 * 60 * 60 * 1000)
          : null,
      },
    });
    created++;
    console.log(`Created: ${listing.title}${featuredDays ? ` [★ featured ${featuredDays}d]` : ''}`);
  }

  console.log(`\nDone — ${created} new listings created across ${sellers.length} sellers.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
