'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Users, Clock, Navigation, Star } from 'lucide-react';

// Types
interface AugustinerLocation {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
}

interface Friend {
    id: number;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
}

interface LocationScore {
    location: AugustinerLocation;
    averageDistance: number;
    maxDistance: number;
    totalTravelTime: number;
    playerDistances: { player: string; distance: number; travelTime: number }[];
}

// Leaflet types
interface LeafletMap {
    setView: (center: [number, number], zoom: number) => LeafletMap;
    remove: () => void;
    removeLayer: (layer: LeafletLayer) => LeafletMap;
}

interface LeafletIcon {
    divIcon: (options: {
        html: string;
        className: string;
        iconSize: [number, number];
        iconAnchor: [number, number];
    }) => LeafletDivIcon;
}

type LeafletDivIcon = object;

interface LeafletMarker {
    bindPopup: (content: string) => LeafletMarker;
    on: (event: string, handler: () => void) => LeafletMarker;
    addTo: (map: LeafletMap) => LeafletMarker;
}

interface LeafletPolyline {
    addTo: (map: LeafletMap) => LeafletPolyline;
}

type LeafletLayer = object;

interface LeafletTileLayer {
    addTo: (map: LeafletMap) => LeafletTileLayer;
}

interface LeafletLibrary extends LeafletIcon {
    map: (element: HTMLElement) => LeafletMap;
    tileLayer: (url: string, options: { attribution: string }) => LeafletTileLayer;
    marker: (position: [number, number], options: { icon: LeafletDivIcon }) => LeafletMarker;
    polyline: (
        points: [number, number][],
        options: {
            color: string;
            weight: number;
            opacity: number;
            dashArray: string;
        }
    ) => LeafletPolyline;
}

interface MapInstance {
    map: LeafletMap;
    L: LeafletLibrary;
    markers: (LeafletMarker | LeafletPolyline)[];
}

// Your friends data - update with real addresses
const friends: Friend[] = [
    { id: 1, name: "Max", address: "Maxvorstadt, München" },
    { id: 2, name: "Anna", address: "Schwabing, München" },
    { id: 3, name: "Tom", address: "Haidhausen, München" },
    { id: 4, name: "Lisa", address: "Glockenbachviertel, München" },
    { id: 5, name: "Hans", address: "Sendling, München" },
    { id: 6, name: "Maria", address: "Bogenhausen, München" },
    { id: 7, name: "Stefan", address: "Neuhausen, München" },
    { id: 8, name: "Clara", address: "Au, München" }
];

const AugustinerFinder = () => {
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
    const [calculatedResults, setCalculatedResults] = useState<LocationScore[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [transportMode, setTransportMode] = useState<'foot' | 'bike' | 'car'>('foot');
    const [showMap, setShowMap] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [augustinerLocations, setAugustinerLocations] = useState<AugustinerLocation[]>([]);
    const [friendsWithCoords, setFriendsWithCoords] = useState<Friend[]>(friends);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<MapInstance | null>(null);

    // Fetch Augustiner locations on component mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('/api/locations');
                const data = await response.json();

                if (data.locations) {
                    setAugustinerLocations(data.locations);
                }
            } catch (err) {
                console.error('Failed to fetch locations:', err);
                setError('Failed to load Augustiner locations');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    // Geocode friend addresses
    useEffect(() => {
        const geocodeFriends = async () => {
            const geocodedFriends = await Promise.all(
                friends.map(async (friend) => {
                    try {
                        const response = await fetch('/api/geocode', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address: friend.address })
                        });

                        const data = await response.json();

                        if (data.lat && data.lng) {
                            return { ...friend, lat: data.lat, lng: data.lng };
                        }
                    } catch (err) {
                        console.error(`Failed to geocode ${friend.name}:`, err);
                    }

                    return friend;
                })
            );

            setFriendsWithCoords(geocodedFriends);
        };

        geocodeFriends();
    }, []);

    // Haversine distance fallback
    const calculateHaversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const calculateTravelTime = (distance: number, mode: string): number => {
        const speeds = { foot: 5, bike: 15, car: 30 };
        return (distance / speeds[mode as keyof typeof speeds]) * 60;
    };

    // Calculate optimal locations using real GraphHopper routing
    const calculateOptimalLocations = useCallback(async () => {
        if (selectedPlayers.length === 0 || augustinerLocations.length === 0) {
            setCalculatedResults([]);
            return;
        }

        setIsCalculating(true);

        try {
            const selectedFriends = friendsWithCoords.filter(f =>
                selectedPlayers.includes(f.id) && f.lat && f.lng
            );

            const results: LocationScore[] = await Promise.all(
                augustinerLocations.map(async (location) => {
                    const playerDistances = await Promise.all(
                        selectedFriends.map(async (friend) => {
                            try {
                                const response = await fetch('/api/routing', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        points: [[friend.lng, friend.lat], [location.lng, location.lat]],
                                        vehicle: transportMode
                                    })
                                });

                                const data = await response.json();

                                if (data.distance && data.time) {
                                    return {
                                        player: friend.name,
                                        distance: data.distance,
                                        travelTime: data.time
                                    };
                                }
                            } catch (err) {
                                console.error(`Routing failed for ${friend.name}:`, err);
                            }

                            // Fallback to Haversine distance if routing fails
                            const distance = calculateHaversineDistance(
                                friend.lat!, friend.lng!, location.lat, location.lng
                            );
                            const travelTime = calculateTravelTime(distance, transportMode);

                            return {
                                player: friend.name,
                                distance,
                                travelTime
                            };
                        })
                    );

                    const averageDistance = playerDistances.reduce((sum, pd) => sum + pd.distance, 0) / playerDistances.length;
                    const maxDistance = Math.max(...playerDistances.map(pd => pd.distance));
                    const totalTravelTime = playerDistances.reduce((sum, pd) => sum + pd.travelTime, 0);

                    return {
                        location,
                        averageDistance,
                        maxDistance,
                        totalTravelTime,
                        playerDistances
                    };
                })
            );

            results.sort((a, b) => a.averageDistance - b.averageDistance);
            setCalculatedResults(results);
        } catch (err) {
            console.error('Calculation failed:', err);
            setError('Failed to calculate optimal locations');
        } finally {
            setIsCalculating(false);
        }
    }, [selectedPlayers, transportMode, augustinerLocations, friendsWithCoords]);

    // Helper functions
    const togglePlayer = (playerId: number) => {
        setSelectedPlayers(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const getLocationTypeIcon = (type: string) => {
        switch (type) {
            case 'brewery': return '🍺';
            case 'biergarten': return '🌳';
            case 'restaurant': return '🍽️';
            default: return '🍻';
        }
    };

    const getScoreColor = (index: number) => {
        if (index === 0) return 'bg-green-100 border-green-300';
        if (index === 1) return 'bg-blue-100 border-blue-300';
        if (index === 2) return 'bg-yellow-100 border-yellow-300';
        return 'bg-gray-100 border-gray-300';
    };

    // Initialize map
    useEffect(() => {
        if (!showMap || !mapRef.current || mapInstanceRef.current) return;

        // Dynamically load Leaflet
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);

            // Check if Leaflet is loaded before using it
            if (typeof (window as unknown as { L?: LeafletLibrary }).L !== 'undefined') {
                // Initialize map
                const L = (window as unknown as Window & { L: LeafletLibrary }).L;
                const map = L.map(mapRef.current!).setView([48.1351, 11.5820], 12);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                mapInstanceRef.current = { map, L, markers: [] };
                updateMapMarkers();
            }
        };
        document.head.appendChild(script);

        return () => {
            if (mapInstanceRef.current?.map) {
                mapInstanceRef.current.map.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [showMap]);

    // Update map markers when data changes
    const updateMapMarkers = useCallback(() => {
        if (!mapInstanceRef.current) return;

        const { map, L, markers } = mapInstanceRef.current;

        // Clear existing markers
        markers.forEach((marker: LeafletMarker | LeafletPolyline) => {
            map.removeLayer(marker as LeafletLayer);
        });
        markers.length = 0;

        // Add Augustiner locations
        augustinerLocations.forEach((location, index) => {
            const isSelected = selectedLocation === location.id;
            const isTopResult = calculatedResults.length > 0 && calculatedResults[0]?.location.id === location.id;
            const resultIndex = calculatedResults.findIndex(r => r.location.id === location.id);

            let iconColor = '#8B4513'; // Default brown
            if (isSelected) iconColor = '#FF6B35'; // Orange for selected
            else if (isTopResult) iconColor = '#22C55E'; // Green for best
            else if (resultIndex >= 0 && resultIndex < 3) iconColor = '#3B82F6'; // Blue for top 3

            const customIcon = L.divIcon({
                html: `<div style="
          background-color: ${iconColor};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">🍺</div>`,
                className: 'custom-augustiner-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([location.lat, location.lng], { icon: customIcon })
                .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-amber-800">${location.name}</h3>
            <p class="text-sm text-gray-600">${location.address}</p>
            <p class="text-xs text-gray-500 capitalize">${location.type}</p>
            ${resultIndex >= 0 ? `<p class="text-sm font-semibold text-green-600">Rank: #${resultIndex + 1}</p>` : ''}
          </div>
        `)
                .on('click', () => setSelectedLocation(location.id))
                .addTo(map);

            markers.push(marker);
        });

        // Add friend locations
        const selectedFriends = friendsWithCoords.filter(f => selectedPlayers.includes(f.id) && f.lat && f.lng);
        selectedFriends.forEach(friend => {
            const friendIcon = L.divIcon({
                html: `<div style="
          background-color: #6366F1;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">👤</div>`,
                className: 'custom-friend-marker',
                iconSize: [25, 25],
                iconAnchor: [12.5, 12.5]
            });

            const marker = L.marker([friend.lat!, friend.lng!], { icon: friendIcon })
                .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-indigo-800">${friend.name}</h3>
            <p class="text-sm text-gray-600">${friend.address}</p>
          </div>
        `)
                .addTo(map);

            markers.push(marker);
        });

        // Draw routes to top location if available
        if (calculatedResults.length > 0 && selectedPlayers.length > 0) {
            const topLocation = calculatedResults[0].location;
            selectedFriends.forEach(friend => {
                const routeLine = L.polyline([
                    [friend.lat!, friend.lng!],
                    [topLocation.lat, topLocation.lng]
                ], {
                    color: '#22C55E',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '5, 10'
                }).addTo(map);

                markers.push(routeLine);
            });
        }

    }, [selectedPlayers, calculatedResults, selectedLocation, augustinerLocations, friendsWithCoords]);

    useEffect(() => {
        updateMapMarkers();
    }, [updateMapMarkers]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-amber-700">Loading Augustiner locations...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-amber-800 mb-2">
                        🍺 Augustiner Schafkopf Finder
                    </h1>
                    <p className="text-lg text-amber-700">
                        Find the perfect Augustiner location for your Schafkopf round in Munich
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Player Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center mb-4">
                                <Users className="w-5 h-5 text-amber-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-800">Select Players</h2>
                            </div>

                            <div className="space-y-3">
                                {friendsWithCoords.map(friend => (
                                    <label key={friend.id} className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayers.includes(friend.id)}
                                            onChange={() => togglePlayer(friend.id)}
                                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <div className="ml-3 flex-1">
                      <span className="text-gray-900 font-medium group-hover:text-amber-700">
                        {friend.name}
                          {!friend.lat && <span className="text-red-500 text-xs ml-1">(no coords)</span>}
                      </span>
                                            <p className="text-sm text-gray-500">{friend.address}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Transport Mode */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <Navigation className="w-5 h-5 text-amber-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-800">Transport Mode</h2>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { mode: 'foot', label: 'Walking 🚶', icon: '🚶' },
                                    { mode: 'bike', label: 'Cycling 🚴', icon: '🚴' },
                                    { mode: 'car', label: 'Driving 🚗', icon: '🚗' }
                                ].map(({ mode, label }) => (
                                    <label key={mode} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="transport"
                                            value={mode}
                                            checked={transportMode === mode}
                                            onChange={(e) => setTransportMode(e.target.value as 'foot' | 'bike' | 'car')}
                                            className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                                        />
                                        <span className="ml-3 text-gray-900">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">Munich Map</h2>
                                </div>
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200 transition-colors"
                                >
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </div>

                            {showMap && (
                                <div className="relative">
                                    <div
                                        ref={mapRef}
                                        className="w-full h-96"
                                        style={{ minHeight: '400px' }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs space-y-1 shadow-lg">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-amber-700 rounded-full mr-2 flex items-center justify-center text-white text-xs">🍺</div>
                                            <span>Augustiner Locations</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2 flex items-center justify-center text-white text-xs">👤</div>
                                            <span>Selected Friends</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">🍺</div>
                                            <span>Best Location</span>
                                        </div>
                                        {calculatedResults.length > 0 && (
                                            <div className="flex items-center">
                                                <div className="w-4 h-1 bg-green-500 mr-2" style={{borderStyle: 'dashed'}}></div>
                                                <span>Routes to Best</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">Top Locations</h2>
                                </div>
                                {selectedPlayers.length > 0 && (
                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedPlayers.length} player{selectedPlayers.length > 1 ? 's' : ''}
                  </span>
                                )}
                            </div>

                            {selectedPlayers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Select players to find optimal locations</p>
                                </div>
                            ) : isCalculating ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Calculating optimal locations...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {calculatedResults.slice(0, 3).map((result, index) => (
                                        <div
                                            key={result.location.id}
                                            onClick={() => {
                                                setSelectedLocation(result.location.id);
                                                if (mapInstanceRef.current) {
                                                    mapInstanceRef.current.map.setView([result.location.lat, result.location.lng], 15);
                                                }
                                            }}
                                            className={`border-2 rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${getScoreColor(index)}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">{getLocationTypeIcon(result.location.type)}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-sm">
                                                            {index === 0 && <Star className="w-3 h-3 text-yellow-500 inline mr-1" />}
                                                            {result.location.name}
                                                        </h3>
                                                        <p className="text-gray-600 text-xs">{result.location.address}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-amber-700">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                                                <div className="text-center">
                                                    <div className="text-gray-500">Avg Dist</div>
                                                    <div className="font-semibold">{result.averageDistance.toFixed(1)} km</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-500 flex items-center justify-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Time
                                                    </div>
                                                    <div className="font-semibold">{Math.round(result.totalTravelTime)} min</div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-2">
                                                <div className="text-xs text-gray-600 mb-1">Players:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {result.playerDistances.slice(0, 3).map(pd => (
                                                        <span
                                                            key={pd.player}
                                                            className="bg-white bg-opacity-70 px-1 py-0.5 rounded text-xs"
                                                        >
                              {pd.player}: {pd.distance.toFixed(1)}km
                            </span>
                                                    ))}
                                                    {result.playerDistances.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                              +{result.playerDistances.length - 3} more
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-8 text-center text-sm text-amber-700">
                    <p>🍺 Prost! Using live data from OpenStreetMap and GraphHopper APIs.</p>
                </div>
            </div>
        </div>
    );
};

export default AugustinerFinder;