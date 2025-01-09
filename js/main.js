// Main application logic and initialization
const zipMap = {
  BASE_GEOJSON_URL:
    "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/",
  map: null,
  currentGeoJSON: null,
  currentLabels: null,
  stateGeoJSONCache: {},
  isPreservingView: false,
  preservedView: null,

  init() {
    // Initialize map centered on US
    this.map = L.map("map", {
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
      },
    }).setView([39.8283, -98.5795], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    this.currentLabels = L.layerGroup().addTo(this.map);
  },

  async showZipCodes() {
    const zipInput = document.getElementById("zipCodes").value;
    if (!zipInput.trim()) return;

    const loadingDiv = document.getElementById("loading");
    const zipCodes = utils.parseZipCodes(zipInput);

    loadingDiv.style.display = "block";

    // Clear existing layers
    if (this.currentGeoJSON) {
      this.map.removeLayer(this.currentGeoJSON);
      this.currentGeoJSON = null;
    }
    this.currentLabels.clearLayers();

    const zipsByState = {};
    zipCodes.forEach((zip) => {
      const state = utils.getStateFromZip(zip);
      if (state) {
        if (!zipsByState[state]) {
          zipsByState[state] = [];
        }
        zipsByState[state].push(zip);
      }
    });

    try {
      const allBounds = L.latLngBounds([]);

      for (const [state, stateZips] of Object.entries(zipsByState)) {
        const geoJSON = await utils.getStateGeoJSON(state);
        const neighborZips = await utils.findNeighboringZips(
          geoJSON,
          stateZips,
        );

        const features = geoJSON.features.filter(
          (feature) =>
            stateZips.includes(feature.properties.ZCTA5CE10) ||
            neighborZips.includes(feature.properties.ZCTA5CE10),
        );

        if (features.length > 0) {
          const layer = L.geoJSON(
            { type: "FeatureCollection", features },
            {
              style: (feature) => mapHandlers.getLayerStyle(feature, stateZips),
              onEachFeature: (feature, layer) => {
                // Add tooltip
                layer.bindTooltip(feature.properties.ZCTA5CE10, {
                  permanent: false,
                  direction: "top",
                  className: "zip-tooltip",
                });

                // Add click handler
                layer.on("click", (e) =>
                  mapHandlers.handleZipClick(feature, layer, stateZips),
                );

                // Add hover handlers
                layer.on({
                  mouseover: mapHandlers.handleMouseOver,
                  mouseout: (e) =>
                    mapHandlers.handleMouseOut(e, feature, stateZips),
                });
              },
            },
          );

          // Add ZIP code labels with dynamic sizing
          features.forEach((feature) => {
            const featureLayer = L.geoJSON(feature);
            const bounds = featureLayer.getBounds();
            const center = bounds.getCenter();
            const fontSize = utils.calculateTextSize(bounds);

            const label = L.marker(center, {
              icon: L.divIcon({
                className: "zip-label",
                html: `<div style="font-size: ${fontSize}px;">${feature.properties.ZCTA5CE10}</div>`,
                iconSize: [60, 20],
                iconAnchor: [30, 10],
              }),
            });

            this.currentLabels.addLayer(label);
          });

          layer.addTo(this.map);

          if (!this.currentGeoJSON) {
            this.currentGeoJSON = layer;
          } else {
            this.currentGeoJSON.addLayer(layer);
          }

          allBounds.extend(layer.getBounds());
        }
      }

      // Handle view management
      if (this.isPreservingView && this.preservedView) {
        // Strictly preserve the previous view when adding new ZIPs
        this.map.setView(this.preservedView.center, this.preservedView.zoom, {
          animate: false,
          duration: 0,
        });
      } else if (allBounds.isValid()) {
        // Only fit bounds for new ZIP code sets
        this.map.fitBounds(allBounds, { padding: [50, 50] });
      }
    } catch (error) {
      console.error("Error loading ZIP codes:", error);
    } finally {
      loadingDiv.style.display = "none";
    }
  },
};

// Initialize the map when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => zipMap.init());
