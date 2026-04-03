import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // If canceling, mark the time slot as available again
    if (body.status === 'cancelled' && appointment.status !== 'cancelled') {
      await prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { isAvailable: true },
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: body.status },
      include: {
        stylist: true,
        service: true,
        timeSlot: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
