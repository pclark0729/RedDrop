import React, { useState, useEffect, useCallback } from 'react';
import { Box, FormControl, FormLabel, FormErrorMessage, Input, Text, VStack, useToast } from '@chakra-ui/react';
import { AddressAutofill } from '@mapbox/search-js-react';

interface MapboxAddressInputProps {
  label?: string;
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
  mapboxAccessToken: string;
}

const MapboxAddressInput: React.FC<MapboxAddressInputProps> = ({
  label = 'Address',
  value,
  onChange,
  placeholder = 'Enter your address',
  isRequired = false,
  error,
  mapboxAccessToken
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [addressComponents, setAddressComponents] = useState<Record<string, string>>({});
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(true);
  const toast = useToast();
  
  // Update local state when prop value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value || '');
    }
  }, [value]);

  // Safe onChange handler that ensures we always pass a string
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || '';
    setInputValue(newValue);
    
    // Only call onChange if the value has actually changed
    if (newValue !== value) {
      onChange(newValue, coordinates || undefined);
    }
  }, [onChange, value, coordinates]);

  // Handle Mapbox address selection
  const handleRetrieve = useCallback((res: any) => {
    try {
      console.log('Mapbox address data:', res);
      
      // Validate response has the expected structure
      if (!res || !res.features || !res.features.length || !res.features[0]) {
        console.error('Invalid Mapbox response format:', res);
        return;
      }
      
      const feature = res.features[0];
      console.log('Selected feature:', feature);
      
      // Extract the full address - prioritize place_name which contains the complete address
      let fullAddress = '';
      
      // Check if place_name exists in properties (this is where the full address is usually stored)
      if (feature.properties && feature.properties.place_name) {
        fullAddress = feature.properties.place_name;
        console.log('Using place_name from properties:', fullAddress);
      }
      // Try place_name directly on the feature (standard format)
      else if (feature.place_name) {
        fullAddress = feature.place_name;
        console.log('Using place_name from feature:', fullAddress);
      } 
      // Try text_en (seen in the error logs) - but only if we don't have a better option
      else if (feature.text_en) {
        // If we have context, try to build a more complete address
        if (feature.context && Array.isArray(feature.context)) {
          const contextParts = feature.context
            .map((ctx: any) => ctx.text || ctx.text_en)
            .filter(Boolean);
          
          if (contextParts.length > 0) {
            fullAddress = `${feature.text_en}, ${contextParts.join(', ')}`;
          } else {
            fullAddress = feature.text_en;
          }
        } else {
          fullAddress = feature.text_en;
        }
        console.log('Using text_en with context:', fullAddress);
      }
      // Try name or text as fallback
      else if (feature.name) {
        fullAddress = feature.name;
        console.log('Using name as fallback:', fullAddress);
      } else if (feature.text) {
        fullAddress = feature.text;
        console.log('Using text as fallback:', fullAddress);
      } else {
        // If we still don't have an address, try to construct from properties
        const addressParts = [];
        
        if (feature.properties) {
          const props = feature.properties;
          
          // Try to build address from common address properties
          if (props.address) addressParts.push(props.address);
          if (props.street) addressParts.push(props.street);
          if (props.housenumber) addressParts.push(props.housenumber);
          if (props.city) addressParts.push(props.city);
          if (props.state) addressParts.push(props.state);
          if (props.country) addressParts.push(props.country);
          if (props.postcode) addressParts.push(props.postcode);
          
          if (addressParts.length > 0) {
            fullAddress = addressParts.join(', ');
            console.log('Constructed address from properties:', fullAddress);
          }
        }
      }
      
      // If we still don't have an address, use the input value
      if (!fullAddress) {
        console.warn('Could not extract address from Mapbox response, using input value');
        fullAddress = inputValue;
      }
      
      // Extract coordinates
      let lat: number | undefined;
      let lng: number | undefined;
      
      if (feature.geometry && feature.geometry.coordinates) {
        [lng, lat] = feature.geometry.coordinates;
      }
      
      // Validate coordinates
      const validCoordinates = 
        typeof lng === 'number' && !isNaN(lng) && 
        typeof lat === 'number' && !isNaN(lat);
      
      let newCoordinates: { lat: number; lng: number } | undefined;
      
      if (validCoordinates) {
        newCoordinates = { lat, lng };
        setCoordinates(newCoordinates);
      } else {
        console.warn('Invalid or missing coordinates in Mapbox response');
        setCoordinates(null);
      }
      
      // Extract address components
      const components: Record<string, string> = {};
      
      // Parse address components from context and properties
      if (feature.context && Array.isArray(feature.context)) {
        feature.context.forEach((ctx: any) => {
          if (ctx) {
            // Try to extract the type from id
            let id = '';
            if (ctx.id && typeof ctx.id === 'string') {
              id = ctx.id.split('.')[0];
            }
            
            // Get the text value
            const text = ctx.text || ctx.text_en || '';
            
            if (id && text) {
              components[id] = text;
            }
          }
        });
      }
      
      // Add the main address components from properties
      if (feature.properties) {
        Object.keys(feature.properties).forEach(key => {
          if (feature.properties[key] !== undefined && feature.properties[key] !== null) {
            components[key] = String(feature.properties[key]);
          }
        });
      }
      
      // Add the address text
      if (feature.text || feature.text_en) {
        components.address = feature.text || feature.text_en;
      }
      
      // Set state
      setAddressComponents(components);
      setInputValue(fullAddress);
      
      // Call the onChange handler with the full address and coordinates
      onChange(fullAddress, newCoordinates);
      
      console.log('Address components extracted:', components);
      console.log('Full address:', fullAddress);
      
      // Show success toast
      toast({
        title: 'Address Selected',
        description: 'Address has been successfully selected and filled.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error processing Mapbox address data:', error);
      toast({
        title: 'Address Selection Error',
        description: 'There was an error processing the selected address. Please try typing your address manually.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [onChange, toast, inputValue]);

  // Check if Mapbox is loaded
  useEffect(() => {
    if (!mapboxAccessToken) {
      setIsMapboxLoaded(false);
      console.warn('Mapbox access token is missing');
    } else {
      setIsMapboxLoaded(true);
    }
  }, [mapboxAccessToken]);

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <Box position="relative">
        {isMapboxLoaded ? (
          <AddressAutofill accessToken={mapboxAccessToken} onRetrieve={handleRetrieve}>
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={handleChange}
              autoComplete="address-line1"
            />
          </AddressAutofill>
        ) : (
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            autoComplete="address-line1"
          />
        )}
      </Box>
      
      {coordinates && (
        <VStack align="start" spacing={0} mt={1}>
          <Text fontSize="xs" color="gray.500">
            Selected address details:
          </Text>
          <Text fontSize="xs" color="gray.500">
            {inputValue}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </Text>
        </VStack>
      )}
      
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default MapboxAddressInput; 