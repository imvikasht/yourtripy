import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapActivity {
  title: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time: string;
}

interface MapComponentProps {
  activities?: MapActivity[];
  days?: {
    day: number;
    activities: MapActivity[];
  }[];
}

const DAY_COLORS = [
  '#FF7A18', // Day 1 - Primary Orange
  '#FF4D4D', // Day 2 - Red
  '#4D79FF', // Day 3 - Blue
  '#4DFF88', // Day 4 - Green
  '#FFD700', // Day 5 - Gold
  '#FF00FF', // Day 6 - Magenta
  '#00FFFF', // Day 7 - Cyan
];

// Component to handle map centering and bounds
const MapBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) {
      console.error("MapBounds: map is undefined!");
      return;
    }
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [100, 100] });
    }
  }, [points, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ activities, days }) => {
  if (typeof window === 'undefined') return null;

  const allActivities = days 
    ? days.flatMap(d => d.activities) 
    : (activities || []);
    
  const points: [number, number][] = allActivities.map(a => [a.coordinates.lat, a.coordinates.lng]);

  if (allActivities.length === 0) {
    return (
      <div className="w-full h-full bg-brand-dark rounded-[3rem] flex items-center justify-center text-brand-slate/40 font-black uppercase tracking-[0.2em]">
        No coordinates available
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[3rem] overflow-hidden border border-brand-primary/10 shadow-inner relative z-10">
      <MapContainer 
        key={JSON.stringify(points)}
        center={points[0]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw areas and lines for each day */}
        {days ? (
          days.map((day, dayIdx) => {
            const dayPoints: [number, number][] = day.activities.map(a => [a.coordinates.lat, a.coordinates.lng]);
            const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
            
            return (
              <React.Fragment key={day.day}>
                {dayPoints.length > 1 && (
                  <Polyline 
                    positions={dayPoints} 
                    color={color} 
                    weight={6} 
                    opacity={0.4} 
                  />
                )}
                {dayPoints.length > 1 && (
                  <Polyline 
                    positions={dayPoints} 
                    color={color} 
                    weight={2} 
                    opacity={1} 
                    dashArray="5, 10"
                  />
                )}
                {day.activities.map((activity, idx) => (
                  <React.Fragment key={`${day.day}-${idx}`}>
                    <Circle 
                      center={[activity.coordinates.lat, activity.coordinates.lng]}
                      radius={300}
                      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.1, weight: 1 }}
                    />
                    <Marker 
                      position={[activity.coordinates.lat, activity.coordinates.lng]}
                      icon={DefaultIcon}
                    >
                      <Popup>
                        <div className="font-sans">
                          <p className="font-black text-brand-primary text-[10px] uppercase tracking-widest mb-1">Day {day.day} • {activity.time}</p>
                          <p className="font-bold text-brand-heading">{activity.title}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })
        ) : (
          <>
            {points.length > 1 && (
              <Polyline 
                positions={points} 
                color="#FF7A18" 
                weight={6} 
                opacity={0.4} 
              />
            )}
            {points.length > 1 && (
              <Polyline 
                positions={points} 
                color="#FF7A18" 
                weight={2} 
                opacity={1} 
                dashArray="5, 10"
              />
            )}
            {allActivities.map((activity, idx) => (
              <React.Fragment key={idx}>
                <Circle 
                  center={[activity.coordinates.lat, activity.coordinates.lng]}
                  radius={300}
                  pathOptions={{ color: '#FF7A18', fillColor: '#FF7A18', fillOpacity: 0.1, weight: 1 }}
                />
                <Marker position={[activity.coordinates.lat, activity.coordinates.lng]} icon={DefaultIcon}>
                  <Popup>
                    <div className="font-sans">
                      <p className="font-black text-brand-primary text-xs uppercase tracking-widest mb-1">{activity.time}</p>
                      <p className="font-bold text-brand-heading">{activity.title}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </>
        )}
        
        <MapBounds points={points} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
