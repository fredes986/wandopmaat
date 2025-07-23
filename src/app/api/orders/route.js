import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const orderDetails = await request.json();

        // Haal de benodigde data uit het ontvangen object
        const { typeWand, afmetingen, materialen, totaalprijs, profileThickness, platingLayers, plateType, hasInsulation } = orderDetails;

        // Voer de SQL-query uit om de data in de database op te slaan
        await db.sql`
     INSERT INTO orders (wall_type, wall_length_mm, wall_height_mm, total_price, materials, profile_thickness_mm, plating_layers, plate_type, has_insulation)
VALUES (${typeWand}, ${afmetingen.lengte}, ${afmetingen.hoogte}, ${totaalprijs}, ${JSON.stringify(materialen)}, ${profileThickness}, ${platingLayers}, ${plateType}, ${hasInsulation});
    `;

        return NextResponse.json({ message: 'Order created successfully' }, { status: 200 });
    } catch (error) {
        console.error('Fout bij opslaan van bestelling:', error);
        return NextResponse.json({ error: 'Kon bestelling niet aanmaken' }, { status: 500 });
    }
}