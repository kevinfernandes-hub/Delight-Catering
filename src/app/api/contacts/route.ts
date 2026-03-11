import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const contact = await prisma.contact.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                event_type: body.event_type,
                event_date: new Date(body.event_date),
                guest_count: parseInt(body.guest_count),
                message: body.message,
            },
        });
        return NextResponse.json(contact, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { created_at: 'desc' },
        });
        return NextResponse.json(contacts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
