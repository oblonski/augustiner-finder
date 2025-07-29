export interface Friend {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
    // Optional: alternative starting location
    alternativeLocation?: {
        address: string;
        lat: number;
        lng: number;
    };
}

// Your card-playing friends with their home locations
// Update these coordinates with actual values from geocoding
export const friends: Friend[] = [
    {
        id: 1,
        name: "Joa",
        address: "Maxvorstadt, München",
        lat: 48.162435,
        lng: 11.54579
    },
    {
        id: 2,
        name: "Björn",
        address: "Glockenbach, München",
        lat: 48.12865118920213,
        lng: 11.568114124345698
    },
    {
        id: 3,
        name: "Fabi",
        address: "Solln, München",
        lat: 48.07957822724855,
        lng: 11.525763711237387
    },
    {
        id: 4,
        name: "Stefan L.",
        address: "Großhadern, München",
        lat: 48.11970958371606,
        lng: 11.47556119823739
    },
    {
        id: 5,
        name: "Joshi",
        address: "Westend, München",
        lat: 48.134677813860286,
        lng: 11.540355118866012
    },
    {
        id: 6,
        name: "Timo",
        address: "Laim, München",
        lat: 48.141357045448224,
        lng: 11.505470736301795
    },
    {
        id: 7,
        name: "Tobi",
        address: "Maxvorstadt, München",
        lat: 48.15285560220485,
        lng: 11.551508598466462
    },
    {
        id: 8,
        name: "Stefan S.",
        address: "Sendling, München",
        lat: 48.123286497827166,
        lng: 11.542996305838122
    }
];

// Helper function to get friend's current location
export function getFriendLocation(friend: Friend, useAlternative: boolean = false) {
    if (useAlternative && friend.alternativeLocation) {
        return {
            address: friend.alternativeLocation.address,
            lat: friend.alternativeLocation.lat,
            lng: friend.alternativeLocation.lng
        };
    }
    return {
        address: friend.address,
        lat: friend.lat,
        lng: friend.lng
    };
}