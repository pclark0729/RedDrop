import React from 'react';

interface MapboxProviderProps {
  children: React.ReactNode;
  accessToken: string;
}

// This is a simple context provider for the Mapbox access token
// We don't need MapboxSearchProvider from the package as it doesn't exist
const MapboxProvider: React.FC<MapboxProviderProps> = ({ children, accessToken }) => {
  // Simply pass the children through, we'll use the accessToken directly in components that need it
  return <>{children}</>;
};

export default MapboxProvider; 