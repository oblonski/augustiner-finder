'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
    iconUrl: icon.src || '/marker-icon.png',
    shadowUrl: iconShadow.src || '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapProps {
    augustinerLocations: Array<{
        id: number
        name: string
        lat: number
        lng: number
        address: string
        type: string
    }>
    friends: Array<{
        id: number
        name: string
        lat: number
        lng: number
        address: string
    }>
    selectedPlayers: number[]
    calculatedResults: Array<{
        location: {
            id: number
            name: string
            lat: number
            lng: number
        }
    }>
    selectedLocation: number | null
    onLocationSelect: (id: number) => void
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    
    return null
}

export default function Map({
    augustinerLocations,
    friends,
    selectedPlayers,
    calculatedResults,
    selectedLocation,
    onLocationSelect
}: MapProps) {
    const getLocationIcon = (location: { id: number; name: string; lat: number; lng: number; address: string; type: string }) => {
        const isSelected = selectedLocation === location.id
        const isTopResult = calculatedResults.length > 0 && calculatedResults[0]?.location.id === location.id
        const resultIndex = calculatedResults.findIndex(r => r.location.id === location.id)

        let iconColor = '#8B4513' // Default brown
        if (isSelected) iconColor = '#FF6B35' // Orange for selected
        else if (isTopResult) iconColor = '#22C55E' // Green for best
        else if (resultIndex >= 0 && resultIndex < 6) iconColor = '#3B82F6' // Blue for top 6

        return L.divIcon({
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
        })
    }

    const getFriendIcon = () => {
        return L.divIcon({
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
        })
    }

    const selectedFriends = friends.filter(f => selectedPlayers.includes(f.id))

    return (
        <MapContainer
            center={[48.1351, 11.5820]}
            zoom={12}
            style={{ width: '100%', height: '100%', minHeight: '600px' }}
            className="z-0"
            attributionControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={19}
                subdomains="abcd"
            />

            {/* Augustiner locations */}
            {augustinerLocations.map((location) => {
                const resultIndex = calculatedResults.findIndex(r => r.location.id === location.id)
                
                return (
                    <Marker
                        key={location.id}
                        position={[location.lat, location.lng]}
                        icon={getLocationIcon(location)}
                        eventHandlers={{
                            click: () => onLocationSelect(location.id)
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-amber-800">{location.name}</h3>
                                <p className="text-sm text-gray-600">{location.address}</p>
                                <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                                {resultIndex >= 0 && (
                                    <p className="text-sm font-semibold text-green-600">
                                        Rank: #{resultIndex + 1}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}

            {/* Friend locations */}
            {selectedFriends.map(friend => (
                <Marker
                    key={friend.id}
                    position={[friend.lat, friend.lng]}
                    icon={getFriendIcon()}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-indigo-800">{friend.name}</h3>
                            <p className="text-sm text-gray-600">{friend.address}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Routes to top location */}
            {calculatedResults.length > 0 && selectedPlayers.length > 0 && (
                <>
                    {selectedFriends.map(friend => {
                        const topLocation = calculatedResults[0].location
                        return (
                            <Polyline
                                key={`route-${friend.id}`}
                                positions={[
                                    [friend.lat, friend.lng],
                                    [topLocation.lat, topLocation.lng]
                                ]}
                                color="#22C55E"
                                weight={3}
                                opacity={0.7}
                                dashArray="5, 10"
                            />
                        )
                    })}
                </>
            )}

            {selectedLocation && (
                <MapController 
                    center={[
                        augustinerLocations.find(l => l.id === selectedLocation)?.lat || 48.1351,
                        augustinerLocations.find(l => l.id === selectedLocation)?.lng || 11.5820
                    ]} 
                    zoom={15} 
                />
            )}
        </MapContainer>
    )
}