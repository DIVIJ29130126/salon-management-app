import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const salons = await prisma.salon.findMany({
      include: {
        stylists: true,
        services: true,
        operatingHours: true,
      },
    });

    return NextResponse.json(salons);
  } catch (error) {
    console.error('Error fetching salons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const salon = await prisma.salon.create({
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
      },
    });

    return NextResponse.json(salon, { status: 201 });
  } catch (error) {
    console.error('Error creating salon:', error);
    return NextResponse.json(
      { error: 'Failed to create salon' },
      { status: 500 }
    );
  }
}
