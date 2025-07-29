export interface AugustinerLocation {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: 'brewery' | 'biergarten' | 'restaurant' | 'bar';
}

// Static Augustiner locations in Munich
// You can update these coordinates with more accurate ones if needed
export const augustinerLocations: AugustinerLocation[] = [
    {
        id: 82772298,
        name: "Augustiner Bräustuben",
        lat: 48.1392055,
        lng: 11.5456469,
        address: "Landsberger Straße 19, 80339 München",
        type: "restaurant"
    },
    {
        id: 86673907,
        name: "Haidhauser Augustiner",
        lat: 48.1293429,
        lng: 11.6013051,
        address: "Wörthstraße 34, 81667 München",
        type: "restaurant"
    },
    {
        id: 92666832,
        name: "Augustiner Schützengarten",
        lat: 48.1042541,
        lng: 11.5344051,
        address: "Zielstattstraße 6, 81379 München",
        type: "restaurant"
    },
    {
        id: 295985890,
        name: "Augustiner am Dante",
        lat: 48.1678310,
        lng: 11.5272482,
        address: "Dantestraße 16, 80637 München",
        type: "restaurant"
    },
    {
        id: 295993624,
        name: "Augustiner am Dom",
        lat: 48.1382031,
        lng: 11.5740213,
        address: "Frauenplatz 8, 80331 München",
        type: "restaurant"
    },
    {
        id: 354451797,
        name: "Augustiner Spieglwirt",
        lat: 48.1820912,
        lng: 11.5214611,
        address: "München",
        type: "restaurant"
    },
    {
        id: 359740043,
        name: "Sendlinger Augustiner",
        lat: 48.1211786,
        lng: 11.5437926,
        address: "Alramstraße 24, 81371 München",
        type: "restaurant"
    },
    {
        id: 367787214,
        name: "Augustiner Bürgerheim",
        lat: 48.1359951,
        lng: 11.5375122,
        address: "Bergmannstraße 33, 80339 München",
        type: "restaurant"
    },
    {
        id: 559536142,
        name: "Zum Augustiner",
        lat: 48.1384328,
        lng: 11.5687592,
        address: "Neuhauser Straße 27, 80331 München",
        type: "restaurant"
    },
    {
        id: 606974977,
        name: "Neuhauser Augustiner",
        lat: 48.1592242,
        lng: 11.5405877,
        address: "Hübnerstraße 23, 80637 München",
        type: "restaurant"
    },
    {
        id: 893397453,
        name: "Riva Bar (Augustiner Bräu Stub'n)",
        lat: 48.1836427,
        lng: 11.5790046,
        address: "Milbertshofener Straße 94, 80807 München",
        type: "bar"
    },
    {
        id: 2375892971,
        name: "Haderner Augustiner",
        lat: 48.1151313,
        lng: 11.4793204,
        address: "Würmtalstraße 113, 81375 München",
        type: "restaurant"
    },
    {
        id: 2701880121,
        name: "Augustiner Kurgarten",
        lat: 48.1494923,
        lng: 11.5085254,
        address: "De-la-Paz-Straße 10, 80639 München",
        type: "restaurant"
    },
    {
        id: 2879920304,
        name: "Augustiner Klosterwirt",
        lat: 48.1384542,
        lng: 11.5722656,
        address: "Augustinerstraße 1, 80331 München",
        type: "restaurant"
    },
    {
        id: 4449167089,
        name: "Garchinger Augustiner",
        lat: 48.2502416,
        lng: 11.6534185,
        address: "Garching, München",
        type: "restaurant"
    },
    {
        id: 5720010326,
        name: "Augustiner Bierhalle",
        lat: 48.1384215,
        lng: 11.5689180,
        address: "Neuhauser Straße 27, 80331 München",
        type: "bar"
    },
    {
        id: 9047980483,
        name: "Augustiner Stehausschank",
        lat: 48.1380910,
        lng: 11.5741147,
        address: "Frauenplatz 9, 80331 München",
        type: "bar"
    },
    {
        id: 4609522,
        name: "Augustiner-Keller",
        lat: 48.1435335, // Calculated center from bounds
        lng: 11.5515974,
        address: "Arnulfstraße 52, 80335 München",
        type: "biergarten"
    },
    {
        id: 36965867,
        name: "Augustiner Schützengarten",
        lat: 48.1044640, // Calculated center from bounds
        lng: 11.5347906,
        address: "Zielstattstraße 6, 81379 München",
        type: "biergarten"
    },
    {
        id: 79817244,
        name: "Augustiner am Platzl",
        lat: 48.1375355, // Calculated center from bounds
        lng: 11.5794053,
        address: "Orlandostraße 5, 80331 München",
        type: "restaurant"
    },
    {
        id: 334355896,
        name: "Augustiner Bräustüberl",
        lat: 48.1391660, // Calculated center from bounds
        lng: 11.5450916,
        address: "München",
        type: "biergarten"
    },
    {
        id: 1382881944,
        name: "Augustiner-Keller Restaurant",
        lat: 48.1435166, // Calculated center from bounds
        lng: 11.5521515,
        address: "Arnulfstraße 52, 80335 München",
        type: "restaurant"
    }
];