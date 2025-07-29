import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { points, vehicle = 'foot' } = await request.json();

        // GraphHopper Routing API
        const response = await fetch('https://graphhopper.com/api/1/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                points,
                vehicle,
                locale: 'de',
                key: process.env.GRAPHHOPPER_API_KEY
            })
        });

        const data = await response.json();

        if (data.paths && data.paths.length > 0) {
            const path = data.paths[0];
            return NextResponse.json({
                distance: path.distance / 1000, // Convert to km
                time: path.time / 60000, // Convert to minutes
                points: path.points
            });
        }

        return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    } catch (error) {
        console.error('Routing error:', error);
        return NextResponse.json({ error: 'Routing failed' }, { status: 500 });
    }
}