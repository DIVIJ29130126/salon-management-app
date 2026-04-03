import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const salonId = request.nextUrl.searchParams.get('salonId');
    const stylistId = request.nextUrl.searchParams.get('stylistId');

    const where: any = {};
    if (salonId) where.salonId = salonId;
    if (stylistId) where.stylistId = stylistId;

    const walkIns = await prisma.walkIn.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(walkIns);
  } catch (error) {
    console.error('Error fetching walk-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch walk-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const walkIn = await prisma.walkIn.create({
      data: {
        salonId: body.salonId,
        stylistId: body.stylistId,
        customerName: body.customerName,
        serviceName: body.serviceName,
        price: body.price,
        duration: body.duration,
        notes: body.notes,
      },
    });

    return NextResponse.json(walkIn, { status: 201 });
  } catch (error) {
    console.error('Error creating walk-in:', error);
    return NextResponse.json(
      { error: 'Failed to create walk-in' },
      { status: 500 }
    );
  }
}
