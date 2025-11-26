import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Activity {
    id?: number;
    coordinates?: { lat: number; lng: number };
    type: string;
    date: Date;
    details?: any;
}

interface HeatMapProps {
    activities: Activity[];
    center?: [number, number];
    zoom?: number;
}

function HeatLayer({ activities }: { activities: Activity[] }) {
    const map = useMap();
    const heatLayerRef = useRef<any>(null);

    useEffect(() => {
        if (!map) return;

        // Remove existing heat layer
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        // Filter activities with coordinates
        const points = activities
            .filter(a => a.coordinates)
            .map(a => [a.coordinates!.lat, a.coordinates!.lng, 0.5] as [number, number, number]);

        if (points.length > 0) {
            // Create heat layer
            heatLayerRef.current = (L as any).heatLayer(points, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.0: 'blue',
                    0.5: 'lime',
                    0.7: 'yellow',
                    1.0: 'red'
                }
            }).addTo(map);
        }

        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
            }
        };
    }, [map, activities]);

    return null;
}

export function HeatMap({ activities, center = [4.5709, -74.2973], zoom = 13 }: HeatMapProps) {
    const activitiesWithCoords = activities.filter(a => a.coordinates);

    // Calculate center from activities if available
    const mapCenter: [number, number] = activitiesWithCoords.length > 0
        ? [
            activitiesWithCoords.reduce((sum, a) => sum + a.coordinates!.lat, 0) / activitiesWithCoords.length,
            activitiesWithCoords.reduce((sum, a) => sum + a.coordinates!.lng, 0) / activitiesWithCoords.length
        ]
        : center;

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <HeatLayer activities={activities} />

                {activitiesWithCoords.map((activity) => (
                    <Marker
                        key={activity.id}
                        position={[activity.coordinates!.lat, activity.coordinates!.lng]}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{activity.type}</p>
                                <p className="text-xs text-gray-600">
                                    {new Date(activity.date).toLocaleDateString()}
                                </p>
                                <p className="text-xs">
                                    {activity.coordinates!.lat.toFixed(6)}, {activity.coordinates!.lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
