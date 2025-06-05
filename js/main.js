class ZipMap {
    constructor() {
      this.BASE_GEOJSON_URL = "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/";
      this.map = null;
      this.currentGeoJSON = null;
      this.currentLabels = null;
      this.stateGeoJSONCache = {};
      this.isPreservingView = false;
      this.preservedView = null;
      this.searchRadius = 0;
      this.inputFormat = 'comma';
      this.debounceTimer = null;
      this.currentAbortController = null;
      this.distanceCache = new Map();
  
      document.addEventListener("DOMContentLoaded", () => this.init());
      this.initializeRadiusControl();
      this.initializeInputDebouncing();
    }
  
    detectInputFormat(input) {
      if (!input.trim()) return 'comma';
      return input.includes('\n') && !input.includes(',') ? 'newline' : 'comma';
    }
  
    initializeRadiusControl() {
      const radiusInput = document.getElementById('radiusInput');
      radiusInput.value = this.searchRadius;
      radiusInput.addEventListener('change', (e) => {
        const radius = parseInt(e.target.value, 10);
        if (radius >= 0 && radius <= 100) {
          this.searchRadius = radius;
          this.distanceCache.clear(); // Clear cache when radius changes
          if (document.getElementById('zipCodes').value) {
            this.debouncedShowZipCodes();
          }
        }
      });
    }

    initializeInputDebouncing() {
      const zipInput = document.getElementById('zipCodes');
      zipInput.addEventListener('input', () => {
        this.debouncedShowZipCodes();
      });
    }

    debouncedShowZipCodes() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (document.getElementById('zipCodes').value.trim()) {
          this.showZipCodes();
        }
      }, 300);
    }
  
    init() {
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
    }

    clearMap() {
      if (this.currentAbortController) {
        this.currentAbortController.abort();
      }
      
      if (this.currentGeoJSON) {
        this.map.removeLayer(this.currentGeoJSON);
        this.currentGeoJSON = null;
      }
      
      this.currentLabels.clearLayers();
      document.getElementById('zipCodes').value = '';
      document.getElementById('loading').style.display = 'none';
      this.distanceCache.clear();
    }
  
    async showZipCodes() {
      const zipInput = document.getElementById("zipCodes").value;
      if (!zipInput.trim()) return;

      // Cancel any ongoing request
      if (this.currentAbortController) {
        this.currentAbortController.abort();
      }
      this.currentAbortController = new AbortController();
  
      // Set input format when showing zip codes
      this.inputFormat = this.detectInputFormat(zipInput);
  
      const loadingDiv = document.getElementById("loading");
      const zipCodes = utils.parseZipCodes(zipInput);
  
      loadingDiv.style.display = "block";
      loadingDiv.textContent = `Loading ${zipCodes.length} ZIP code${zipCodes.length === 1 ? '' : 's'}...`;
  
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
          if (this.currentAbortController.signal.aborted) {
            return;
          }
          
          loadingDiv.textContent = `Loading ${state} ZIP codes...`;
          const geoJSON = await utils.getStateGeoJSON(state, this.currentAbortController.signal);
          
          if (this.currentAbortController.signal.aborted) {
            return;
          }
          
          // Get neighboring zips only if radius > 0
          const neighborZips = await utils.findNeighboringZips(geoJSON, stateZips, this.searchRadius, this.distanceCache);
          
          const features = geoJSON.features.filter((feature) =>
            stateZips.includes(feature.properties.ZCTA5CE10) ||
            neighborZips.includes(feature.properties.ZCTA5CE10)
          );
  
          if (features.length > 0) {
            const layer = L.geoJSON(
              { type: "FeatureCollection", features },
              {
                style: (feature) => ({
                  fillColor: stateZips.includes(feature.properties.ZCTA5CE10) ? '#3388ff' : '#666',
                  weight: 2,
                  opacity: 1,
                  color: 'white',
                  fillOpacity: 0.7
                }),
                onEachFeature: (feature, layer) => {
                  layer.bindTooltip(feature.properties.ZCTA5CE10, {
                    permanent: false,
                    direction: "top",
                    className: "zip-tooltip",
                  });
  
                  layer.on("click", () => {
                    const zipCode = feature.properties.ZCTA5CE10;
                    const input = document.getElementById("zipCodes");
                    if (!utils.parseZipCodes(input.value).includes(zipCode)) {
                      const currentValue = input.value.trim();
                      // Format new zip according to current input format
                      input.value = currentValue ? 
                        (this.inputFormat === 'newline' ? `${currentValue}\n${zipCode}` : `${currentValue}, ${zipCode}`) : 
                        zipCode;
                      this.showZipCodes();
                    }
                  });
                },
              }
            );
  
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
  
        if (this.isPreservingView && this.preservedView) {
          this.map.setView(this.preservedView.center, this.preservedView.zoom, {
            animate: false,
            duration: 0,
          });
        } else if (allBounds.isValid()) {
          this.map.fitBounds(allBounds, { padding: [50, 50] });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error loading ZIP codes:", error);
          loadingDiv.textContent = "Error loading ZIP codes. Please try again.";
          setTimeout(() => {
            loadingDiv.style.display = "none";
          }, 3000);
        }
      } finally {
        if (!this.currentAbortController.signal.aborted) {
          loadingDiv.style.display = "none";
          this.currentAbortController = null;
        }
      }
    }
  }
  
  const zipMap = new ZipMap();