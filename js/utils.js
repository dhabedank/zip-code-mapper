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

    async getStateGeoJSON(state) {
        if (zipMap.stateGeoJSONCache[state]) {
            return zipMap.stateGeoJSONCache[state];
        }

        const response = await fetch(
            zipMap.BASE_GEOJSON_URL + STATE_ZIP_RANGES[state].file
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
        let sumLat = 0;
        let sumLon = 0;
        let count = 0;

        coordinates[0].forEach(coord => {
            sumLon += coord[0];
            sumLat += coord[1];
            count++;
        });

        return [sumLat / count, sumLon / count];
    },

    async findNeighboringZips(geoJSON, targetZips, maxDistance = 30) {
        const neighbors = new Set();
        const targetFeatures = geoJSON.features.filter(f => 
            targetZips.includes(f.properties.ZCTA5CE10)
        );

        const targetCentroids = targetFeatures.map(f => ({
            zip: f.properties.ZCTA5CE10,
            centroid: this.getPolygonCentroid(f.geometry.coordinates)
        }));

        geoJSON.features.forEach(feature => {
            if (!targetZips.includes(feature.properties.ZCTA5CE10)) {
                const featureCentroid = this.getPolygonCentroid(feature.geometry.coordinates);
                
                const isNearby = targetCentroids.some(target => {
                    const distance = this.calculateDistance(
                        featureCentroid[0],
                        featureCentroid[1],
                        target.centroid[0],
                        target.centroid[1]
                    );
                    return distance <= maxDistance;
                });

                if (isNearby) {
                    neighbors.add(feature.properties.ZCTA5CE10);
                }
            }
        });

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