import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

type LatLng = { lat: number, lng: number };

interface MapProps {
  markers: LatLng[];
}

const containerStyle = { width: "100%", height: "100%" };

const CardMap: React.FC<MapProps> = ({ markers }) => {
  // console.log(markers)
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  if (!isLoaded) return <div>Loading...</div>;
  console.log(markers)
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markers[0] || { lat: 0, lng: 0 }}
      zoom={1}
    >
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos} />
      ))}
    </GoogleMap>
  );
};

export default CardMap;