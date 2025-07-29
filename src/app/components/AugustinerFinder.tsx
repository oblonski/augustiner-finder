'use client'

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Users, Clock, Navigation, Star, Edit2, Check, X } from 'lucide-react';
import { augustinerLocations } from '@/data/augustinerLocations';
import { friends as staticFriends } from '@/data/friends';

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse" />
});

// Import types from data files
import type { AugustinerLocation } from '@/data/augustinerLocations';

interface LocationScore {
    location: AugustinerLocation;
    averageDistance: number;
    maxDistance: number;
    totalTravelTime: number;
    playerDistances: { player: string; distance: number; travelTime: number }[];
}

const AugustinerFinder = () => {
    const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
    const [calculatedResults, setCalculatedResults] = useState<LocationScore[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [transportMode, setTransportMode] = useState<'foot' | 'bike' | 'car'>('foot');
    const [calculationMethod, setCalculationMethod] = useState<'haversine' | 'graphhopper'>('graphhopper');
    const [showMap, setShowMap] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [editingFriend, setEditingFriend] = useState<number | null>(null);
    const [tempAddress, setTempAddress] = useState('');
    const [locationOverrides, setLocationOverrides] = useState<{[key: number]: {address: string, lat: number, lng: number}}>({});
    const [expandedPlayers, setExpandedPlayers] = useState<{[key: number]: boolean}>({});

    // Get friends with location overrides applied
    const getFriendsWithOverrides = () => {
        return staticFriends.map(friend => {
            if (locationOverrides[friend.id]) {
                return {
                    ...friend,
                    ...locationOverrides[friend.id]
                };
            }
            return friend;
        });
    };

    const friendsWithOverrides = getFriendsWithOverrides();

    // Handle editing friend locations
    const startEditingFriend = (friendId: number) => {
        const friend = friendsWithOverrides.find(f => f.id === friendId);
        if (friend) {
            setEditingFriend(friendId);
            setTempAddress(friend.address);
        }
    };

    const cancelEditingFriend = () => {
        setEditingFriend(null);
        setTempAddress('');
    };

    const saveLocationOverride = async (friendId: number) => {
        if (!tempAddress.trim()) return;

        try {
            // Geocode the new address
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: tempAddress })
            });

            const data = await response.json();

            if (data.lat && data.lng) {
                setLocationOverrides(prev => ({
                    ...prev,
                    [friendId]: {
                        address: tempAddress,
                        lat: data.lat,
                        lng: data.lng
                    }
                }));
                setEditingFriend(null);
                setTempAddress('');
                // Clear results so user needs to recalculate with new location
                setCalculatedResults([]);
            } else {
                alert('Could not find coordinates for this address. Please try a more specific address.');
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            alert('Failed to geocode address. Please try again.');
        }
    };

    const resetFriendLocation = (friendId: number) => {
        setLocationOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[friendId];
            return newOverrides;
        });
        // Clear results so user needs to recalculate
        setCalculatedResults([]);
    };

    const toggleExpandPlayers = (locationId: number) => {
        setExpandedPlayers(prev => ({
            ...prev,
            [locationId]: !prev[locationId]
        }));
    };

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
            return;
        }

        setIsCalculating(true);

        try {
            const selectedFriends = friendsWithOverrides.filter(f =>
                selectedPlayers.includes(f.id)
            );

            const results: LocationScore[] = await Promise.all(
                augustinerLocations.map(async (location) => {
                    const playerDistances = await Promise.all(
                        selectedFriends.map(async (friend) => {
                            if (calculationMethod === 'haversine') {
                                // Use Haversine distance calculation
                                const distance = calculateHaversineDistance(
                                    friend.lat, friend.lng, location.lat, location.lng
                                );
                                const travelTime = calculateTravelTime(distance, transportMode);

                                return {
                                    player: friend.name,
                                    distance,
                                    travelTime
                                };
                            } else {
                                // Use GraphHopper routing
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
                                    console.error(`GraphHopper routing failed for ${friend.name}:`, err);
                                }

                                // Fallback to Haversine distance if GraphHopper fails
                                const distance = calculateHaversineDistance(
                                    friend.lat, friend.lng, location.lat, location.lng
                                );
                                const travelTime = calculateTravelTime(distance, transportMode);

                                return {
                                    player: friend.name,
                                    distance,
                                    travelTime
                                };
                            }
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
            // Could add error handling here if needed
        } finally {
            setIsCalculating(false);
        }
    }, [selectedPlayers, transportMode, calculationMethod, friendsWithOverrides]);

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
        if (index === 3) return 'bg-purple-100 border-purple-300';
        if (index === 4) return 'bg-orange-100 border-orange-300';
        if (index === 5) return 'bg-pink-100 border-pink-300';
        return 'bg-gray-100 border-gray-300';
    };



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

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Player Selection */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex items-center mb-4">
                                <Users className="w-5 h-5 text-amber-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-800">Select Players</h2>
                            </div>

                            <div className="space-y-3">
                                {friendsWithOverrides.map(friend => (
                                    <div key={friend.id} className="border rounded-lg p-3 bg-gray-50">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedPlayers.includes(friend.id)}
                                                onChange={() => togglePlayer(friend.id)}
                                                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                            />
                                            <div className="ml-3 flex-1">
                                                <span className="text-gray-900 font-medium group-hover:text-amber-700">
                                                    {friend.name}
                                                    {locationOverrides[friend.id] && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                            Custom Location
                                                        </span>
                                                    )}
                                                </span>
                                                {editingFriend === friend.id ? (
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            value={tempAddress}
                                                            onChange={(e) => setTempAddress(e.target.value)}
                                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                            placeholder="Enter new address..."
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    saveLocationOverride(friend.id);
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex gap-1 mt-1">
                                                            <button
                                                                onClick={() => saveLocationOverride(friend.id)}
                                                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center"
                                                            >
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEditingFriend}
                                                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 flex items-center"
                                                            >
                                                                <X className="w-3 h-3 mr-1" />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-sm text-gray-500">{friend.address}</p>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => startEditingFriend(friend.id)}
                                                                className="text-xs text-amber-600 hover:text-amber-700 flex items-center"
                                                                title="Edit location"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            {locationOverrides[friend.id] && (
                                                                <button
                                                                    onClick={() => resetFriendLocation(friend.id)}
                                                                    className="text-xs text-red-600 hover:text-red-700 flex items-center"
                                                                    title="Reset to home location"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transport Mode */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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

                        {/* Calculation Method */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                                <h2 className="text-xl font-semibold text-gray-800">Calculation Method</h2>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calculation"
                                        value="graphhopper"
                                        checked={calculationMethod === 'graphhopper'}
                                        onChange={(e) => setCalculationMethod(e.target.value as 'haversine' | 'graphhopper')}
                                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 mt-0.5"
                                    />
                                    <div className="ml-3">
                                        <span className="text-gray-900 font-medium">Real Travel Times 🛣️</span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Uses GraphHopper API for accurate routing with real roads, traffic patterns, and elevation
                                        </p>
                                    </div>
                                </label>
                                
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="calculation"
                                        value="haversine"
                                        checked={calculationMethod === 'haversine'}
                                        onChange={(e) => setCalculationMethod(e.target.value as 'haversine' | 'graphhopper')}
                                        className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 mt-0.5"
                                    />
                                    <div className="ml-3">
                                        <span className="text-gray-900 font-medium">Air Distance ✈️</span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Fast calculation using straight-line distance (as the crow flies)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Calculate Button */}
                            <div className="mt-4">
                                <button
                                    onClick={calculateOptimalLocations}
                                    disabled={selectedPlayers.length === 0 || isCalculating}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
                                        selectedPlayers.length === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : isCalculating
                                            ? 'bg-amber-400 text-white cursor-wait'
                                            : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg'
                                    }`}
                                >
                                    {isCalculating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-5 h-5 mr-2" />
                                            Find Best Locations
                                        </>
                                    )}
                                </button>
                                {selectedPlayers.length === 0 && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Select at least one player to calculate
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Map and Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Map */}
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
                                <div className="relative h-[600px] overflow-visible">
                                    <Map
                                        augustinerLocations={augustinerLocations}
                                        friends={friendsWithOverrides}
                                        selectedPlayers={selectedPlayers}
                                        calculatedResults={calculatedResults}
                                        selectedLocation={selectedLocation}
                                        onLocationSelect={setSelectedLocation}
                                    />
                                    {/* Manual attribution if Leaflet's doesn't show */}
                                    <div className="absolute bottom-1 right-1 bg-white bg-opacity-90 px-2 py-1 text-xs text-gray-600 rounded shadow-sm z-20 space-y-0.5">
                                        <div>
                                            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">OpenStreetMap</a> contributors
                                        </div>
                                        {calculationMethod === 'graphhopper' && calculatedResults.length > 0 && (
                                            <div>
                                                Powered by <a href="https://www.graphhopper.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">GraphHopper API</a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white rounded-lg p-3 text-xs space-y-1.5 shadow-lg z-10 border border-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-amber-700 rounded-full mr-2 flex items-center justify-center text-white text-xs">🍺</div>
                                            <span className="text-gray-700 font-medium">Augustiner Locations</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2 flex items-center justify-center text-white text-xs">👤</div>
                                            <span className="text-gray-700 font-medium">Selected Friends</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">🍺</div>
                                            <span className="text-gray-700 font-medium">Best Location</span>
                                        </div>
                                        {calculatedResults.length > 0 && (
                                            <div className="flex items-center">
                                                <div className="w-4 h-1 bg-green-500 mr-2" style={{borderStyle: 'dashed'}}></div>
                                                <span className="text-gray-700 font-medium">Routes to Best</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-800">Top Locations</h2>
                                </div>
                                <div className="flex gap-2">
                                    {calculatedResults.length > 0 && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            {calculationMethod === 'graphhopper' ? '🛣️ Real Routes' : '✈️ Air Distance'}
                                        </span>
                                    )}
                                    {selectedPlayers.length > 0 && (
                                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedPlayers.length} player{selectedPlayers.length > 1 ? 's' : ''}
                      </span>
                                    )}
                                </div>
                            </div>

                            {selectedPlayers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Select players to find optimal locations</p>
                                </div>
                            ) : calculatedResults.length === 0 && !isCalculating ? (
                                <div className="text-center py-12">
                                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Click &quot;Find Best Locations&quot; to calculate</p>
                                    <p className="text-gray-400 text-sm mt-2">We&apos;ll find the best Augustiner spots for your group</p>
                                </div>
                            ) : isCalculating ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Calculating optimal locations...</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {calculatedResults.slice(0, 6).map((result, index) => (
                                        <div
                                            key={result.location.id}
                                            onClick={() => setSelectedLocation(result.location.id)}
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
                                                    <div className="text-gray-700 font-medium">Avg Dist</div>
                                                    <div className="font-bold text-gray-900">{result.averageDistance.toFixed(1)} km</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-700 font-medium flex items-center justify-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Time
                                                    </div>
                                                    <div className="font-bold text-gray-900">{Math.round(result.totalTravelTime)} min</div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-2">
                                                <div className="text-xs text-gray-700 font-medium mb-1">Players:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {(expandedPlayers[result.location.id] ? result.playerDistances : result.playerDistances.slice(0, 3)).map(pd => (
                                                        <span
                                                            key={pd.player}
                                                            className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs font-medium"
                                                        >
                              {pd.player}: {pd.distance.toFixed(1)}km
                            </span>
                                                    ))}
                                                    {result.playerDistances.length > 3 && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpandPlayers(result.location.id);
                                                            }}
                                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium underline cursor-pointer"
                                                        >
                                                            {expandedPlayers[result.location.id] 
                                                                ? 'Show less' 
                                                                : `+${result.playerDistances.length - 3} more`
                                                            }
                                                        </button>
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