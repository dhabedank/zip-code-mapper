const mapHandlers = {
  async handleZipClick(feature, layer, stateZips) {
    const clickedZip = feature.properties.ZCTA5CE10;
    const isTarget = stateZips.includes(clickedZip);

    if (!isTarget) {
      const currentView = {
        center: zipMap.map.getCenter(),
        zoom: zipMap.map.getZoom(),
      };

      const textarea = document.getElementById("zipCodes");
      const currentContent = textarea.value;

      const hasCommas = currentContent.includes(",");
      const hasNewlines = currentContent.includes("\n");

      let newContent;
      if (hasNewlines || (!hasCommas && !hasNewlines)) {
        newContent = currentContent
          ? currentContent + "\n" + clickedZip
          : clickedZip;
      } else {
        newContent = currentContent
          ? currentContent + ", " + clickedZip
          : clickedZip;
      }

      textarea.value = newContent;

      zipMap.isPreservingView = true;
      zipMap.preservedView = currentView;

      try {
        await zipMap.showZipCodes();
      } finally {
        zipMap.isPreservingView = false;
        zipMap.preservedView = null;
      }
    }
  },

  handleMouseOver(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      fillOpacity: 0.5,
    });
    layer.bringToFront();
  },

  handleMouseOut(e, feature, stateZips) {
    const layer = e.target;
    const isTarget = stateZips.includes(feature.properties.ZCTA5CE10);
    layer.setStyle({
      weight: 2,
      fillOpacity: isTarget ? 0.3 : 0.2,
    });
  },

  getLayerStyle(feature, stateZips) {
    const isTarget = stateZips.includes(feature.properties.ZCTA5CE10);
    return {
      color: isTarget ? "#2563eb" : "#4B5563", 
      weight: 2, 
      opacity: 1,
      fillColor: isTarget ? "#3b82f6" : "#E5E7EB", 
      fillOpacity: isTarget ? 0.3 : 0.2,
    };
  },
};

class ZipMapHandlers {
  constructor(map, labelsGroup) {
      this.map = map;
      this.labelsGroup = labelsGroup;
      this.searchRadius = 0;
      this.currentLayers = new L.FeatureGroup();
      this.map.addLayer(this.currentLayers);
  }

    setSearchRadius(radius) {
        this.searchRadius = radius; 
    }

    async showZipCodes(zipCodesString) {
        this.clearExistingLayers();
        
        const zipCodes = parseZipCodes(zipCodesString);
        if (!zipCodes.length) return;

        await this.showSelectedZipCodes(zipCodes);
        if (this.searchRadius > 0) {
            await this.showSurroundingZipCodes(zipCodes);
        }
    }

    async showSelectedZipCodes(zipCodes) {
            for (const zipCode of zipCodes) {
                    try {
                const boundary = await fetchZipBoundary(zipCode);
                        if (boundary) {
                    this.addZipToMap(boundary, zipCode, true);
                        }
                    } catch (error) {
                console.error(`Error loading ZIP code ${zipCode}:`, error);
                    }
                }
            }

    async showSurroundingZipCodes(selectedZipCodes) {
        const processedZips = new Set(selectedZipCodes);
        
        for (const zipCode of selectedZipCodes) {
            const surroundingZips = await findNearbyZipCodes(zipCode, this.searchRadius);
            
            for (const nearbyZip of surroundingZips) {
                if (!processedZips.has(nearbyZip)) {
                    processedZips.add(nearbyZip);
                    try {
                        const boundary = await fetchZipBoundary(nearbyZip);
                        if (boundary) {
                            this.addZipToMap(boundary, nearbyZip, false);
        }
                    } catch (error) {
                        console.error(`Error loading surrounding ZIP code ${nearbyZip}:`, error);
    }
}
}
        }
    }
}