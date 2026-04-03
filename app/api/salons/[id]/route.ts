import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: params.id },
      include: {
        stylists: true,
        services: true,
        operatingHours: true,
      },
    });

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(salon);
  } catch (error) {
    console.error('Error fetching salon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salon' },
      { status: 500 }
    );
  }
}
