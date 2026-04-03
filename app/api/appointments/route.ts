import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const salonId = request.nextUrl.searchParams.get('salonId');
    const stylistId = request.nextUrl.searchParams.get('stylistId');
    const status = request.nextUrl.searchParams.get('status');

    const where: any = {};
    if (salonId) where.salonId = salonId;
    if (stylistId) where.stylistId = stylistId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        stylist: true,
        service: true,
        timeSlot: true,
      },
      orderBy: {
        timeSlot: {
          date: 'desc',
        },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if slot is still available
    const existingSlot = await prisma.timeSlot.findUnique({
      where: { id: body.timeSlotId },
      include: { appointment: true },
    });

    if (!existingSlot || !existingSlot.isAvailable || existingSlot.appointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create appointment and update time slot
    const appointment = await prisma.appointment.create({
      data: {
        salonId: body.salonId,
        stylistId: body.stylistId,
        serviceId: body.serviceId,
        timeSlotId: body.timeSlotId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        notes: body.notes,
        status: 'confirmed',
      },
      include: {
        stylist: true,
        service: true,
        timeSlot: true,
      },
    });

    // Mark the time slot as unavailable
    await prisma.timeSlot.update({
      where: { id: body.timeSlotId },
      data: { isAvailable: false },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
