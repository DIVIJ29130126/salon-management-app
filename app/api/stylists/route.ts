import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const salonId = request.nextUrl.searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json(
        { error: 'salonId is required' },
        { status: 400 }
      );
    }

    const stylists = await prisma.stylist.findMany({
      where: { salonId },
      include: {
        appointments: true,
        timeSlots: true,
      },
    });

    return NextResponse.json(stylists);
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stylists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stylist = await prisma.stylist.create({
      data: {
        salonId: body.salonId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        specialties: body.specialties,
        photoUrl: body.photoUrl,
        bio: body.bio,
      },
    });

    return NextResponse.json(stylist, { status: 201 });
  } catch (error) {
    console.error('Error creating stylist:', error);
    return NextResponse.json(
      { error: 'Failed to create stylist' },
      { status: 500 }
    );
  }
}
