import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();

        const response = await fetch(
            `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(address)}&key=${process.env.GRAPHHOPPER_API_KEY}`
        );

        const data = await response.json();

        if (data.hits && data.hits.length > 0) {
            const hit = data.hits[0];
            return NextResponse.json({
                lat: hit.point.lat,
                lng: hit.point.lng,
                address: hit.name
            });
        }

        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
    }
}