// Event handlers and map interaction logic
const mapHandlers = {
  async handleZipClick(feature, layer, stateZips) {
    const clickedZip = feature.properties.ZCTA5CE10;
    const isTarget = stateZips.includes(clickedZip);

    if (!isTarget) {
      // Get the current map state
      const currentView = {
        center: zipMap.map.getCenter(),
        zoom: zipMap.map.getZoom(),
      };

      // Update the textarea content
      const textarea = document.getElementById("zipCodes");
      const currentContent = textarea.value;

      // Determine format (comma vs newline)
      const hasCommas = currentContent.includes(",");
      const hasNewlines = currentContent.includes("\n");

      // Format new content accordingly
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

      // Update map with strict view preservation
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
