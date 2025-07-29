import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCardFilters } from '@shared/schema';
import 'leaflet/dist/leaflet.css';

interface CreditCardMapProps {
  filters: CreditCardFilters;
}

export default function CreditCardMap({ filters }: CreditCardMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [L, setL] = useState<any>(null);

  const { data: mapData } = useQuery<{ lat: number; lng: number; count: number }[]>({
    queryKey: ['/api/map-data', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      const response = await fetch(`/api/map-data?${params.toString()}`);
      return response.json();
    },
  });

  // Load Leaflet dynamically
  useEffect(() => {
    let isMounted = true;
    
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('leaflet');
        if (isMounted) {
          const leafletInstance = leaflet.default;
          
          // Fix for default markers
          delete (leafletInstance.Icon.Default.prototype as any)._getIconUrl;
          leafletInstance.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
          
          setL(leafletInstance);
          setLeafletLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || !L || !leafletLoaded) return;
    
    // Prevent duplicate initialization
    if (mapInstanceRef.current) {
      return;
    }

    try {
      // Initialize map
      const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [L, leafletLoaded]);

  // Add markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData || !L || !Array.isArray(mapData)) return;

    try {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add markers for each location
      mapData.forEach((location: { lat: number; lng: number; count: number }) => {
        const radius = Math.min(Math.max(location.count * 2, 4), 20);
        const color = location.count > 5 ? '#10B981' : '#1E40AF'; // Green for high density, blue for normal
        
        L.circleMarker([location.lat, location.lng], {
          radius,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6
        })
        .bindPopup(`
          <div class="text-sm">
            <strong>${location.count} card${location.count === 1 ? '' : 's'}</strong><br>
            Lat: ${location.lat.toFixed(4)}<br>
            Lng: ${location.lng.toFixed(4)}
          </div>
        `)
        .addTo(mapInstanceRef.current);
      });
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }, [mapData, L]);

  if (!leafletLoaded) {
    return (
      <div className="h-96 w-full rounded-lg border border-slate-300 flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-96 w-full rounded-lg border border-slate-300"
      data-testid="map-container"
    />
  );
}
