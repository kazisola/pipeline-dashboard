
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import AlertBadge from './AlertBadge';

interface Sensor {
  sensorId: string;
  pipelineId: string;
  type: string;
  value: number;
  unit: string;
  latitude: number;
  longitude: number;
  location: string;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

interface PipelineMapProps {
  sensors: Sensor[];
}

// Map alert level to a color for the marker
const markerColor = (level: string) => {
  if (level === 'CRITICAL') return '#ef4444';
  if (level === 'WARNING') return '#f59e0b';
  return '#22c55e';
};

const PipelineMap = ({ sensors }: PipelineMapProps) => {

  // Calculate the center of all sensors for the initial map view
  // reduce() iterates over the array and accumulates a result
  const center = sensors.length > 0
    ? [
        sensors.reduce((sum, s) => sum + s.latitude, 0) / sensors.length,
        sensors.reduce((sum, s) => sum + s.longitude, 0) / sensors.length,
      ] as [number, number]
    : [29.7604, -95.3698] as [number, number];
  // Default to Houston, TX if no sensors yet

  // Sort sensors by longitude to draw the pipeline line west→east
  const sortedForLine = [...sensors].sort((a, b) => a.longitude - b.longitude);
  const linePositions = sortedForLine.map(s => [s.latitude, s.longitude] as [number, number]);
  // This draws a line connecting all sensors to visualize the pipeline route

  return (
    <div style={{ height: '480px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a3548' }}>
      <MapContainer
        center={center}
        zoom={10}
        // zoom: 10 = city level. 1=world, 5=country, 10=city, 15=street
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* TileLayer loads map imagery from OpenStreetMap — free and open source */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // {s} = subdomain (a,b,c) for load balancing
          // {z} = zoom level
          // {x},{y} = tile coordinates
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          // ALways keep in mind of Attribution as it is legally required when using OpenStreetMap tiles
        />

        {/* Draw the pipeline route as a dashed line */}
        {linePositions.length > 1 && (
          <Polyline
            positions={linePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.6,
              dashArray: '8, 6',
            }}
          />
        )}

        {/* Render a marker for each sensor */}
        {sensors.map((sensor) => (
          <CircleMarker
            key={sensor.sensorId}
            center={[sensor.latitude, sensor.longitude]}
            radius={sensor.alertLevel === 'CRITICAL' ? 14 : 10}
            // CRITICAL sensors get a bigger marker so it's harder to miss
            pathOptions={{
              color: markerColor(sensor.alertLevel),
              fillColor: markerColor(sensor.alertLevel),
              fillOpacity: 0.85,
              weight: sensor.alertLevel === 'CRITICAL' ? 3 : 2,
              // Thicker border for critical sensors
            }}
          >
            {/* Popup appears when user clicks the marker */}
            <Popup>
              <div style={{ minWidth: '200px', fontFamily: 'system-ui' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>
                  {sensor.sensorId}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  📍 {sensor.location}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                  {sensor.value} {sensor.unit}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {sensor.type.replace('_', ' ')}
                </div>
                <AlertBadge level={sensor.alertLevel} />
                <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                  {new Date(sensor.createdAt).toLocaleString()}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default PipelineMap;