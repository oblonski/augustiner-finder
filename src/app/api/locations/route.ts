import { NextRequest, NextResponse } from 'next/server'

// Overpass API response types
interface OverpassElement {
    id: number;
    type: 'node' | 'way' | 'relation';
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: {
        name?: string;
        amenity?: string;
        'addr:street'?: string;
        'addr:housenumber'?: string;
        [key: string]: string | undefined;
    };
}

interface OverpassResponse {
    elements: OverpassElement[];
    version?: number;
    generator?: string;
}

// Our location format
interface AugustinerLocation {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
}

export async function GET() {
    try {
        // Overpass query for Augustiner locations in Munich
        const overpassQuery = `
      [out:json][timeout:25];
      (
        node["name"~"Augustiner"]["amenity"~"pub|restaurant|bar"](48.0,11.3,48.3,11.8);
        way["name"~"Augustiner"]["amenity"~"pub|restaurant|bar"](48.0,11.3,48.3,11.8);
        relation["name"~"Augustiner"]["amenity"~"pub|restaurant|bar"](48.0,11.3,48.3,11.8);
      );
      out geom;
    `;

        const response = await fetch(process.env.OVERPASS_API_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(overpassQuery)}`
        });

        if (!response.ok) {
            console.error('Overpass API error:', response.status, response.statusText);
            return NextResponse.json({ error: 'Failed to fetch from Overpass API' }, { status: 502 });
        }

        const data: OverpassResponse = await response.json();

        // Transform Overpass data to our format
        const locations: AugustinerLocation[] = data.elements
            .map((element: OverpassElement, index: number): AugustinerLocation | null => {
                // Get coordinates - nodes have lat/lon directly, ways/relations have center
                const lat = element.lat || element.center?.lat;
                const lng = element.lon || element.center?.lon;

                // Skip elements without coordinates
                if (!lat || !lng) {
                    return null;
                }

                // Build address from tags
                let address = 'Munich'; // Default fallback
                if (element.tags?.['addr:street']) {
                    const street = element.tags['addr:street'];
                    const houseNumber = element.tags['addr:housenumber'] || '';
                    address = `${street} ${houseNumber}`.trim();
                }

                return {
                    id: element.id || index,
                    name: element.tags?.name || 'Augustiner Location',
                    lat,
                    lng,
                    address,
                    type: element.tags?.amenity || 'pub'
                };
            })
            .filter((location): location is AugustinerLocation => location !== null); // Remove null entries

        console.log(`Found ${locations.length} Augustiner locations`);
        return NextResponse.json({ locations });

    } catch (error) {
        console.error('Error fetching Augustiner locations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
}