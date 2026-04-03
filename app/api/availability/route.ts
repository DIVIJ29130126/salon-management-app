import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const stylistId = request.nextUrl.searchParams.get('stylistId');
    const date = request.nextUrl.searchParams.get('date');

    if (!stylistId || !date) {
      return NextResponse.json(
        { error: 'stylistId and date are required' },
        { status: 400 }
      );
    }

    // Parse date to get the day
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Get available time slots for this stylist on this date
    const slots = await prisma.timeSlot.findMany({
      where: {
        stylistId,
        date: slotDate,
        isAvailable: true,
        appointment: null, // No appointment booked
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
