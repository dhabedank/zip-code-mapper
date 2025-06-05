// Utility functions for ZIP code handling and calculations
const utils = {
    parseZipCodes(input) {
        return input
            .split(/[\n,]+/)
            .map(zip => zip.trim())
            .filter(zip => zip.length > 0);
    },

    getStateFromZip(zip) {
        const zipNum = parseInt(zip);
        for (const [state, range] of Object.entries(STATE_ZIP_RANGES)) {
            if (zipNum >= range.min && zipNum <= range.max) {
                return state;
            }
        }
        return null;
    },

    async getStateGeoJSON(state, signal = null) {
        if (zipMap.stateGeoJSONCache[state]) {
            return zipMap.stateGeoJSONCache[state];
        }

        const response = await fetch(
            zipMap.BASE_GEOJSON_URL + STATE_ZIP_RANGES[state].file,
            { signal }
        );
        const data = await response.json();
        zipMap.stateGeoJSONCache[state] = data;
        return data;
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    getPolygonCentroid(coordinates) {
        const ring = coordinates[0];
        let area = 0;
        let cx = 0;
        let cy = 0;
        
        // Use more accurate centroid calculation for better performance
        for (let i = 0; i < ring.length - 1; i++) {
            const x0 = ring[i][0], y0 = ring[i][1];
            const x1 = ring[i + 1][0], y1 = ring[i + 1][1];
            const a = x0 * y1 - x1 * y0;
            area += a;
            cx += (x0 + x1) * a;
            cy += (y0 + y1) * a;
        }
        
        area *= 0.5;
        if (area === 0) {
            // Fallback to simple average for degenerate polygons
            let sumLat = 0, sumLon = 0;
            ring.forEach(coord => {
                sumLon += coord[0];
                sumLat += coord[1];
            });
            return [sumLat / ring.length, sumLon / ring.length];
        }
        
        return [cy / (6 * area), cx / (6 * area)];
    },

    async findNeighboringZips(geoJSON, targetZips, radius = 0, distanceCache = new Map()) {
        if (radius === 0) return [];
        
        const neighbors = new Set();
        const visited = new Set(targetZips);
        let currentLayer = new Set(targetZips);
        let layerCount = Math.ceil(radius / 2);
        
        // Create a cache key for this state's features
        const createCacheKey = (zip1, zip2) => `${zip1}-${zip2}`;
    
        // Helper to find all immediately adjacent ZIP codes with caching
        const findDirectNeighbors = (zipCode) => {
            const feature = geoJSON.features.find(f => f.properties.ZCTA5CE10 === zipCode);
            if (!feature) return [];
            
            const featureCenter = utils.getPolygonCentroid(feature.geometry.coordinates);
            
            return geoJSON.features
                .filter(f => {
                    if (visited.has(f.properties.ZCTA5CE10)) return false;
                    
                    const neighborZip = f.properties.ZCTA5CE10;
                    const cacheKey = createCacheKey(zipCode, neighborZip);
                    
                    let distance = distanceCache.get(cacheKey);
                    if (distance === undefined) {
                        const neighborCenter = utils.getPolygonCentroid(f.geometry.coordinates);
                        distance = utils.calculateDistance(
                            featureCenter[0], featureCenter[1],
                            neighborCenter[0], neighborCenter[1]
                        );
                        distanceCache.set(cacheKey, distance);
                        distanceCache.set(createCacheKey(neighborZip, zipCode), distance); // Symmetric caching
                    }
                    
                    return distance <= 5;
                })
                .map(f => f.properties.ZCTA5CE10);
        };
    
        // Expand outward layer by layer
        for (let layer = 0; layer < layerCount; layer++) {
            const nextLayer = new Set();
            
            for (const zipCode of currentLayer) {
                const directNeighbors = findDirectNeighbors(zipCode);
                
                for (const neighbor of directNeighbors) {
                    if (!visited.has(neighbor)) {
                        nextLayer.add(neighbor);
                        neighbors.add(neighbor);
                        visited.add(neighbor);
                    }
                }
            }
            
            if (nextLayer.size === 0) break;
            currentLayer = nextLayer;
        }
    
        return Array.from(neighbors);
    },

    calculateTextSize(bounds) {
        const width = Math.abs(bounds.getEast() - bounds.getWest());
        const height = Math.abs(bounds.getNorth() - bounds.getSouth());
        const area = width * height;
        
        const zoomLevel = zipMap.map.getZoom();
        const baseFontSize = 14;
        const scaleFactor = Math.min(1, Math.sqrt(area) * 100) * (zoomLevel / 10);
        return Math.max(8, Math.min(baseFontSize, scaleFactor));
    }
};