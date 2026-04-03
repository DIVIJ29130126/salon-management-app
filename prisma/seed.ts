import { prisma } from '../lib/prisma';

async function main() {
  // Create a sample salon
  const salon = await prisma.salon.create({
    data: {
      name: 'Glam Salon & Spa',
      address: '123 Main Street, Downtown',
      phone: '(555) 123-4567',
      email: 'info@glamsalon.com',
    },
  });

  console.log('✓ Created salon:', salon.name);

  // Create operating hours (Mon-Sat: 10am-6pm, Sun: Closed)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < 7; i++) {
    if (i === 0) {
      // Sunday - closed
      await prisma.operatingHour.create({
        data: {
          salonId: salon.id,
          dayOfWeek: i,
          openTime: '00:00',
          closeTime: '00:00',
          isClosed: true,
        },
      });
    } else {
      await prisma.operatingHour.create({
        data: {
          salonId: salon.id,
          dayOfWeek: i,
          openTime: '10:00',
          closeTime: '18:00',
          isClosed: false,
        },
      });
    }
  }
  console.log('✓ Created operating hours');

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Haircut',
        description: 'Professional haircut and styling',
        durationMins: 30,
        price: 45.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Hair Color',
        description: 'Full color service',
        durationMins: 90,
        price: 85.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Blow Dry',
        description: 'Blow dry and style',
        durationMins: 30,
        price: 35.0,
      },
    }),
    prisma.service.create({
      data: {
        salonId: salon.id,
        name: 'Manicure',
        description: 'Classic manicure',
        durationMins: 45,
        price: 30.0,
      },
    }),
  ]);
  console.log('✓ Created services');

  // Create stylists
  const stylists = await Promise.all([
    prisma.stylist.create({
      data: {
        salonId: salon.id,
        name: 'Sarah Johnson',
        email: 'sarah@glamsalon.com',
        phone: '(555) 111-1111',
        specialties: 'Haircut, Color, Styling',
        bio: 'Master stylist with 10+ years experience',
      },
    }),
    prisma.stylist.create({
      data: {
        salonId: salon.id,
        name: 'Amanda Chen',
        email: 'amanda@glamsalon.com',
        phone: '(555) 222-2222',
        specialties: 'Manicure, Pedicure, Nail Art',
        bio: 'Certified nail technician',
      },
    }),
    prisma.stylist.create({
      data: {
        salonId: salon.id,
        name: 'Marcus Williams',
        email: 'marcus@glamsalon.com',
        phone: '(555) 333-3333',
        specialties: 'Haircut, Beard Trim',
        bio: 'Barber with specialty in men\'s grooming',
      },
    }),
  ]);
  console.log('✓ Created stylists');

  // Create time slots for the next 7 days
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(slotDate.getDate() + dayOffset);
    
    // Skip Sunday
    if (slotDate.getDay() === 0) continue;

    for (const stylist of stylists) {
      // Create 2-hour slots starting from 10am to 5pm
      for (let hour = 10; hour < 17; hour++) {
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
        
        await prisma.timeSlot.create({
          data: {
            stylistId: stylist.id,
            date: slotDate,
            startTime,
            endTime,
            durationMins: 60,
            isAvailable: true,
          },
        });
      }
    }
  }
  console.log('✓ Created time slots for next 7 days');

  console.log('\n✅ Database seeded successfully!');
  console.log(`Salon ID: ${salon.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
