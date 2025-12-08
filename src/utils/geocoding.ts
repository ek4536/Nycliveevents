// NYC Geocoding Utility
// Maps NYC addresses to approximate lat/lng coordinates

export interface Coordinates {
  lat: number;
  lng: number;
}

// Known NYC venue coordinates (for common locations)
const knownLocations: Record<string, Coordinates> = {
  // Manhattan landmarks
  'madison square garden': { lat: 40.7505, lng: -73.9934 },
  'central park': { lat: 40.7829, lng: -73.9654 },
  'times square': { lat: 40.7580, lng: -73.9855 },
  'union square': { lat: 40.7359, lng: -73.9911 },
  'lincoln center': { lat: 40.7722, lng: -73.9843 },
  'washington square park': { lat: 40.7308, lng: -73.9973 },
  'bryant park': { lat: 40.7536, lng: -73.9832 },
  'the high line': { lat: 40.7480, lng: -74.0048 },
  'chelsea market': { lat: 40.7425, lng: -74.0061 },
  'rockefeller center': { lat: 40.7587, lng: -73.9787 },
  
  // Brooklyn landmarks
  'barclays center': { lat: 40.6826, lng: -73.9754 },
  'prospect park': { lat: 40.6602, lng: -73.9690 },
  'brooklyn bridge': { lat: 40.7061, lng: -73.9969 },
  'coney island': { lat: 40.5755, lng: -73.9707 },
  'brooklyn museum': { lat: 40.6712, lng: -73.9636 },
  'dumbo': { lat: 40.7033, lng: -73.9888 },
  'williamsburg': { lat: 40.7081, lng: -73.9571 },
  'park slope': { lat: 40.6710, lng: -73.9774 },
  'bushwick': { lat: 40.6942, lng: -73.9189 },
  
  // Queens landmarks
  'citi field': { lat: 40.7571, lng: -73.8458 },
  'flushing meadows': { lat: 40.7400, lng: -73.8448 },
  'astoria': { lat: 40.7722, lng: -73.9300 },
  'long island city': { lat: 40.7447, lng: -73.9485 },
  'rockaway beach': { lat: 40.5834, lng: -73.8154 },
  
  // Bronx landmarks
  'yankee stadium': { lat: 40.8296, lng: -73.9262 },
  'bronx zoo': { lat: 40.8506, lng: -73.8769 },
  'pelham bay park': { lat: 40.8664, lng: -73.8067 },
  
  // Staten Island landmarks
  'st. george theatre': { lat: 40.6431, lng: -74.0776 },
  'snug harbor': { lat: 40.6440, lng: -74.1021 },
  'staten island zoo': { lat: 40.6257, lng: -74.1154 }
};

// NYC neighborhood/area coordinates for approximation
const neighborhoodCenters: Record<string, Coordinates> = {
  // Manhattan neighborhoods
  'financial district': { lat: 40.7074, lng: -74.0113 },
  'tribeca': { lat: 40.7163, lng: -74.0086 },
  'soho': { lat: 40.7233, lng: -74.0030 },
  'greenwich village': { lat: 40.7336, lng: -74.0027 },
  'east village': { lat: 40.7265, lng: -73.9815 },
  'west village': { lat: 40.7358, lng: -74.0036 },
  'chelsea': { lat: 40.7465, lng: -74.0014 },
  'gramercy': { lat: 40.7379, lng: -73.9862 },
  'midtown': { lat: 40.7549, lng: -73.9840 },
  'hell\'s kitchen': { lat: 40.7638, lng: -73.9918 },
  'upper east side': { lat: 40.7736, lng: -73.9566 },
  'upper west side': { lat: 40.7870, lng: -73.9754 },
  'harlem': { lat: 40.8116, lng: -73.9465 },
  'morningside heights': { lat: 40.8089, lng: -73.9613 },
  'inwood': { lat: 40.8677, lng: -73.9212 },
  
  // Brooklyn neighborhoods
  'downtown brooklyn': { lat: 40.6942, lng: -73.9866 },
  'brooklyn heights': { lat: 40.6958, lng: -73.9936 },
  'fort greene': { lat: 40.6910, lng: -73.9744 },
  'williamsburg': { lat: 40.7081, lng: -73.9571 },
  'greenpoint': { lat: 40.7304, lng: -73.9517 },
  'bushwick': { lat: 40.6942, lng: -73.9189 },
  'bedford-stuyvesant': { lat: 40.6872, lng: -73.9418 },
  'crown heights': { lat: 40.6689, lng: -73.9420 },
  'sunset park': { lat: 40.6490, lng: -74.0060 },
  'bay ridge': { lat: 40.6264, lng: -74.0299 },
  'flatbush': { lat: 40.6528, lng: -73.9590 },
  
  // Queens neighborhoods
  'astoria': { lat: 40.7722, lng: -73.9300 },
  'long island city': { lat: 40.7447, lng: -73.9485 },
  'flushing': { lat: 40.7677, lng: -73.8330 },
  'jamaica': { lat: 40.6976, lng: -73.8123 },
  'forest hills': { lat: 40.7186, lng: -73.8448 },
  'jackson heights': { lat: 40.7557, lng: -73.8831 },
  
  // Bronx neighborhoods
  'south bronx': { lat: 40.8141, lng: -73.9190 },
  'fordham': { lat: 40.8612, lng: -73.8977 },
  'riverdale': { lat: 40.8908, lng: -73.9087 },
  
  // Staten Island neighborhoods
  'st. george': { lat: 40.6431, lng: -74.0776 },
  'south beach': { lat: 40.5824, lng: -74.0741 }
};

// Borough centers as fallback
const boroughCenters: Record<string, Coordinates> = {
  'manhattan': { lat: 40.7831, lng: -73.9712 },
  'brooklyn': { lat: 40.6782, lng: -73.9442 },
  'queens': { lat: 40.7282, lng: -73.7949 },
  'bronx': { lat: 40.8448, lng: -73.8648 },
  'staten island': { lat: 40.5795, lng: -74.1502 }
};

/**
 * Geocode an NYC address to approximate coordinates
 * This is a mock geocoder that uses known locations and patterns
 * In production, you would use Google Maps Geocoding API or similar
 */
export function geocodeNYCAddress(address: string): Coordinates | null {
  const normalizedAddress = address.toLowerCase();
  
  // Check for known landmarks/venues first
  for (const [location, coords] of Object.entries(knownLocations)) {
    if (normalizedAddress.includes(location)) {
      return addRandomOffset(coords);
    }
  }
  
  // Check neighborhoods
  for (const [neighborhood, coords] of Object.entries(neighborhoodCenters)) {
    if (normalizedAddress.includes(neighborhood)) {
      return addRandomOffset(coords);
    }
  }
  
  // Parse street address patterns for approximation
  const streetMatch = normalizedAddress.match(/(\d+)\s+([nsew]?\s*\d+(?:st|nd|rd|th))/);
  if (streetMatch) {
    const streetNum = parseInt(streetMatch[2].replace(/[^\d]/g, ''));
    
    // Manhattan has a grid system - approximate based on street numbers
    if (normalizedAddress.includes('new york, ny')) {
      if (streetNum < 14) {
        return addRandomOffset(neighborhoodCenters['greenwich village']);
      } else if (streetNum < 34) {
        return addRandomOffset(neighborhoodCenters['chelsea']);
      } else if (streetNum < 59) {
        return addRandomOffset(neighborhoodCenters['midtown']);
      } else if (streetNum < 86) {
        return addRandomOffset(neighborhoodCenters['upper west side']);
      } else {
        return addRandomOffset(neighborhoodCenters['upper east side']);
      }
    }
  }
  
  // Check for borough in address
  for (const [borough, coords] of Object.entries(boroughCenters)) {
    if (normalizedAddress.includes(borough)) {
      return addRandomOffset(coords, 0.02); // Larger offset for borough-level
    }
  }
  
  // Default to Manhattan center
  return addRandomOffset(boroughCenters['manhattan'], 0.015);
}

/**
 * Add a small random offset to coordinates to avoid overlapping markers
 */
function addRandomOffset(coords: Coordinates, maxOffset: number = 0.003): Coordinates {
  return {
    lat: coords.lat + (Math.random() - 0.5) * maxOffset,
    lng: coords.lng + (Math.random() - 0.5) * maxOffset
  };
}

/**
 * Batch geocode multiple addresses
 */
export function batchGeocodeAddresses(addresses: string[]): (Coordinates | null)[] {
  return addresses.map(address => geocodeNYCAddress(address));
}

/**
 * Get borough from address
 */
export function getBoroughFromAddress(address: string): string {
  const normalizedAddress = address.toLowerCase();
  
  if (normalizedAddress.includes('manhattan') || normalizedAddress.includes('new york, ny')) {
    return 'Manhattan';
  } else if (normalizedAddress.includes('brooklyn')) {
    return 'Brooklyn';
  } else if (normalizedAddress.includes('queens')) {
    return 'Queens';
  } else if (normalizedAddress.includes('bronx')) {
    return 'Bronx';
  } else if (normalizedAddress.includes('staten island')) {
    return 'Staten Island';
  }
  
  return 'Manhattan'; // Default
}
