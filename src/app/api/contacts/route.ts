import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { CreateContactSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Validate input
        const validationResult = CreateContactSchema.safeParse(body);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: validationResult.error.issues[0].message },
            { status: 400 }
          );
        }

        const data = validationResult.data;
        const contact = await prisma.contact.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                event_type: data.event_type,
                event_date: new Date(data.event_date),
                guest_count: data.guest_count,
                message: data.message,
            },
        });
        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Contact POST error:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Contact GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}
