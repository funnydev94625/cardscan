import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

type LatLng = { lat: number, lng: number };

interface MapProps {
  markers: LatLng[];
}

const containerStyle = { width: "100%", height: "400px" };

const CardMap: React.FC<MapProps> = ({ markers }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markers[0] || { lat: 47.4979, lng: 19.0402 }}
      zoom={7}
    >
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos} />
      ))}
    </GoogleMap>
  );
};

export default CardMap;