import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

const CardMap: React.FC = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default CardMap;