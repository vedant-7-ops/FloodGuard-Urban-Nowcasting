import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ======================================
// OPENWEATHER API KEY
// ======================================
const WEATHER_API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY;

// ======================================
// SENSOR ICON
// ======================================
const sensorIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ======================================
// START ICON
// ======================================
const startIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#16a34a;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-size:18px;
      font-weight:bold;
    ">
      A
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// ======================================
// DESTINATION ICON
// ======================================
const destinationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:34px;
      height:34px;
      border-radius:50%;
      background:#dc2626;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-size:18px;
      font-weight:bold;
    ">
      B
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// ======================================
// SENSOR STATIONS
// ======================================
const sensorStations = {
  Pune: [
    {
      id: "PUN-01",
      name: "Water Level Sensor",
      position: [18.5204, 73.8567],
      waterLevel: 2.4,
    },
    {
      id: "PUN-02",
      name: "Rain Gauge",
      position: [18.5314, 73.8446],
      waterLevel: 2.1,
    },
    {
      id: "PUN-03",
      name: "Weather Station",
      position: [18.5074, 73.8077],
      waterLevel: 2.8,
    },
  ],

  Mumbai: [
    {
      id: "MUM-01",
      name: "Water Level Sensor",
      position: [19.076, 72.8777],
      waterLevel: 3.1,
    },
    {
      id: "MUM-02",
      name: "Rain Gauge",
      position: [19.033, 73.0297],
      waterLevel: 2.7,
    },
    {
      id: "MUM-03",
      name: "Weather Station",
      position: [19.1136, 72.8697],
      waterLevel: 2.5,
    },
  ],

  Delhi: [
    {
      id: "DEL-01",
      name: "Water Level Sensor",
      position: [28.6139, 77.209],
      waterLevel: 2.2,
    },
    {
      id: "DEL-02",
      name: "Rain Gauge",
      position: [28.5672, 77.21],
      waterLevel: 1.8,
    },
    {
      id: "DEL-03",
      name: "Weather Station",
      position: [28.6304, 77.2177],
      waterLevel: 2.4,
    },
  ],

  Chennai: [
    {
      id: "CHE-01",
      name: "Water Level Sensor",
      position: [13.0827, 80.2707],
      waterLevel: 2.6,
    },
    {
      id: "CHE-02",
      name: "Rain Gauge",
      position: [13.0475, 80.2824],
      waterLevel: 2.1,
    },
    {
      id: "CHE-03",
      name: "Weather Station",
      position: [13.0674, 80.2376],
      waterLevel: 2.5,
    },
  ],
};

// ======================================
// CITY MAP UPDATER
// ======================================
function MapCityUpdater({ cityCenter }) {
  const map = useMap();

  useEffect(() => {
    if (cityCenter) {
      map.flyTo(cityCenter, 12, {
        duration: 1.2,
      });
    }
  }, [cityCenter, map]);

  return null;
}

// ======================================
// MAP CLICK HANDLER
// ======================================
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  return null;
}

// ======================================
// ROUTE FITTER
// ======================================
function RouteMapFitter({ routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (
      routeCoordinates &&
      routeCoordinates.length > 1
    ) {
      const bounds =
        L.latLngBounds(routeCoordinates);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [routeCoordinates, map]);

  return null;
}

// ======================================
// MAIN COMPONENT
// ======================================
function FloodMap({
  cityCenter,
  selectedCity = "Pune",
  onLocationSelect,

  // NEW SAFE ROUTE PROPS
  routeRequest,
  onRouteResult,
}) {
  const [mapMode, setMapMode] =
    useState("satellite");

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [locationName, setLocationName] =
    useState("");

  const [locationWeather, setLocationWeather] =
    useState(null);

  const [
    loadingLocationWeather,
    setLoadingLocationWeather,
  ] = useState(false);

  const [locationError, setLocationError] =
    useState("");

  // ======================================
  // ROUTE STATES
  // ======================================
  const [routeCoordinates, setRouteCoordinates] =
    useState([]);

  const [alternativeRoutes, setAlternativeRoutes] =
    useState([]);

  const [routeStart, setRouteStart] =
    useState(null);

  const [routeDestination, setRouteDestination] =
    useState(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  // ======================================
  // MAP CLICK
  // ======================================
  const handleMapClick = async (latlng) => {
    const lat = latlng.lat;
    const lon = latlng.lng;

    setSelectedLocation({
      lat,
      lon,
    });

    setLocationName("");
    setLocationWeather(null);
    setLocationError("");
    setLoadingLocationWeather(true);

    try {
      // ==================================
      // LOCATION NAME
      // ==================================
      const locationResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );

      let finalLocationName =
        "Selected Location";

      if (locationResponse.ok) {
        const locationData =
          await locationResponse.json();

        const address =
          locationData.address || {};

        const area =
          address.suburb ||
          address.neighbourhood ||
          address.village ||
          address.town ||
          address.city_district ||
          address.city ||
          "Selected Location";

        const city =
          address.city ||
          address.town ||
          address.municipality ||
          address.county ||
          "";

        if (
          city &&
          area !== city
        ) {
          finalLocationName =
            `${area}, ${city}`;
        } else {
          finalLocationName = area;
        }
      }

      setLocationName(
        finalLocationName
      );

      // ==================================
      // OPENWEATHER
      // ==================================
      if (!WEATHER_API_KEY) {
        throw new Error(
          "OpenWeather API key is missing"
        );
      }

      const weatherResponse =
        await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );

      if (!weatherResponse.ok) {
        throw new Error(
          "Weather API request failed"
        );
      }

      const weatherData =
        await weatherResponse.json();

      console.log(
        "Clicked Location Weather:",
        weatherData
      );

      setLocationWeather(
        weatherData
      );

      // ==================================
      // RAINFALL
      // ==================================
      const currentRainfall =
        weatherData.rain?.["1h"] ?? 0;

      const currentTemperature =
        weatherData.main?.temp ?? 0;

      const currentHumidity =
        weatherData.main?.humidity ?? 0;

      // ==================================
      // RAINFALL INTENSITY
      // ==================================
      const rainfallIntensity =
        Math.min(
          100,
          Math.round(
            currentRainfall * 20
          )
        );

      // ==================================
      // SEND DATA TO APP
      // ==================================
      if (
        typeof onLocationSelect ===
        "function"
      ) {
        onLocationSelect({
          rainfall:
            currentRainfall,

          waterLevel:
            undefined,

          temperature:
            currentTemperature,

          humidity:
            currentHumidity,

          rainfallIntensity:
            rainfallIntensity,

          stationId: null,

          locationName:
            finalLocationName,

          latitude: lat,

          longitude: lon,
        });
      }
    } catch (error) {
      console.error(
        "Location weather error:",
        error
      );

      setLocationError(
        "Live weather data could not be loaded."
      );
    } finally {
      setLoadingLocationWeather(
        false
      );
    }
  };

  // ======================================
  // GEOCODE LOCATION
  // ======================================
  const geocodeLocation = async (
    location
  ) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        location
      )}`
    );

    if (!response.ok) {
      throw new Error(
        "Location search failed"
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      data.length === 0
    ) {
      throw new Error(
        `Location not found: ${location}`
      );
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
      name:
        data[0].display_name ||
        location,
    };
  };

  // ======================================
  // FIND ROAD ROUTE
  // ======================================
  const findRoadRoute = async (
    startText,
    destinationText
  ) => {
    setRouteLoading(true);
    setRouteError("");

    setRouteCoordinates([]);
    setAlternativeRoutes([]);
    setRouteStart(null);
    setRouteDestination(null);

    try {
      // ==================================
      // GEOCODE START
      // ==================================
      const start =
        await geocodeLocation(
          startText
        );

      // ==================================
      // GEOCODE DESTINATION
      // ==================================
      const destination =
        await geocodeLocation(
          destinationText
        );

      // ==================================
      // OSRM ROUTE API
      // ==================================
      const routeUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start.lon},${start.lat};` +
        `${destination.lon},${destination.lat}` +
        `?overview=full&geometries=geojson&alternatives=true`;

      const response =
        await fetch(routeUrl);

      if (!response.ok) {
        throw new Error(
          "Routing service request failed"
        );
      }

      const data =
        await response.json();

      if (
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
      ) {
        throw new Error(
          "No road route found between these locations."
        );
      }

      // ==================================
      // MAIN ROUTE
      // ==================================
      const mainRoute =
        data.routes[0];

      const mainCoordinates =
        mainRoute.geometry.coordinates.map(
          ([lon, lat]) => [
            lat,
            lon,
          ]
        );

      // ==================================
      // ALTERNATIVE ROUTES
      // ==================================
      const alternatives =
        data.routes
          .slice(1)
          .map((route) =>
            route.geometry.coordinates.map(
              ([lon, lat]) => [
                lat,
                lon,
              ]
            )
          );

      setRouteCoordinates(
        mainCoordinates
      );

      setAlternativeRoutes(
        alternatives
      );

      setRouteStart(start);
      setRouteDestination(
        destination
      );

      // ==================================
      // DISTANCE
      // ==================================
      const distanceKm =
        mainRoute.distance / 1000;

      // ==================================
      // TIME
      // ==================================
      const durationMinutes =
        Math.round(
          mainRoute.duration / 60
        );

      // ==================================
      // SEND RESULT TO APP
      // ==================================
      if (
  typeof onRouteResult ===
  "function"
) {
  onRouteResult({
    success: true,

    start: start,

    destination: destination,

    distanceKm: distanceKm,

    durationMin: durationMinutes,

    alternatives: alternatives.length,
  });
}
    } catch (error) {
      console.error(
        "Route error:",
        error
      );

      setRouteError(
        error.message ||
          "Unable to find route."
      );

      if (
        typeof onRouteResult ===
        "function"
      ) {
        onRouteResult({
          success: false,

          error:
            error.message ||
            "Unable to find route.",
        });
      }
    } finally {
      setRouteLoading(false);
    }
  };

  // ======================================
  // WATCH ROUTE REQUEST FROM APP
  // ======================================
  useEffect(() => {
    if (
      !routeRequest ||
      !routeRequest.start ||
      !routeRequest.destination
    ) {
      return;
    }

    findRoadRoute(
      routeRequest.start,
      routeRequest.destination
    );
  }, [routeRequest]);

  // ======================================
  // CLEAR ROUTE
  // ======================================
  const clearRoute = () => {
    setRouteCoordinates([]);
    setAlternativeRoutes([]);
    setRouteStart(null);
    setRouteDestination(null);
    setRouteError("");

    if (
      typeof onRouteResult ===
      "function"
    ) {
      onRouteResult(null);
    }
  };

  // ======================================
  // MAP LAYERS
  // ======================================
  const weatherLayers = {
    radar: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,

    rainfall: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,

    wind: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,

    temperature: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,

    humidity: `https://tile.openweathermap.org/map/humidity_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,

    pressure: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,
  };

  const activeWeatherLayer =
    weatherLayers[mapMode];

  const stations =
    sensorStations[selectedCity] || [];

  // ======================================
  // BUTTON STYLE
  // ======================================
  const buttonStyle = {
    padding: "9px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  };

  // ======================================
  // RETURN
  // ======================================
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* ==================================
          MAP CONTROLS
      ================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "12px",
          padding: "10px",
          background: "#f8fafc",
          borderRadius: "10px",
          border:
            "1px solid #e2e8f0",
        }}
      >
        {/* SATELLITE */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "satellite"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "satellite"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("satellite")
          }
        >
          🛰️ Satellite Map
        </button>

        {/* RADAR */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "radar"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "radar"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("radar")
          }
        >
          🌧️ RADAR Map
        </button>

        {/* RAINFALL */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "rainfall"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "rainfall"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("rainfall")
          }
        >
          🌧️ Rainfall
        </button>

        {/* WIND */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "wind"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "wind"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("wind")
          }
        >
          💨 Wind
        </button>

        {/* TEMPERATURE */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "temperature"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "temperature"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("temperature")
          }
        >
          🌡️ Temperature
        </button>

        {/* HUMIDITY */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "humidity"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "humidity"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("humidity")
          }
        >
          💧 Humidity
        </button>

        {/* PRESSURE */}

        <button
          style={{
            ...buttonStyle,
            background:
              mapMode === "pressure"
                ? "#2563eb"
                : "#ffffff",
            color:
              mapMode === "pressure"
                ? "#ffffff"
                : "#111827",
          }}
          onClick={() =>
            setMapMode("pressure")
          }
        >
          🧭 Pressure
        </button>
      </div>

      {/* ==================================
          LOCATION READING PANEL
      ================================== */}

      {selectedLocation && (
        <div
          style={{
            marginBottom: "12px",
            padding: "16px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: "12px",
          }}
        >
          {/* LOCATION */}

          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1e3a8a",
              marginBottom: "14px",
            }}
          >
            📍{" "}
            {locationName ||
              "Selected Location"}
          </div>

          {/* DATA GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
            }}
          >
            {/* LATITUDE */}

            <div>
              <b>Latitude</b>
              <br />

              {selectedLocation.lat.toFixed(
                5
              )}
            </div>

            {/* LONGITUDE */}

            <div>
              <b>Longitude</b>
              <br />

              {selectedLocation.lon.toFixed(
                5
              )}
            </div>

            {/* LOADING */}

            {loadingLocationWeather && (
              <div
                style={{
                  gridColumn:
                    "1 / -1",
                  fontWeight:
                    "600",
                }}
              >
                ⏳ Loading live
                monitoring data...
              </div>
            )}

            {/* WEATHER */}

            {locationWeather && (
              <>
                {/* TEMPERATURE */}

                <div>
                  <b>
                    🌡️ Temperature
                  </b>

                  <br />

                  {locationWeather.main
                    ?.temp ??
                    "N/A"}{" "}
                  °C
                </div>

                {/* HUMIDITY */}

                <div>
                  <b>
                    💧 Humidity
                  </b>

                  <br />

                  {locationWeather
                    .main
                    ?.humidity ??
                    "N/A"}{" "}
                  %
                </div>

                {/* WIND */}

                <div>
                  <b>
                    💨 Wind Speed
                  </b>

                  <br />

                  {locationWeather
                    .wind
                    ?.speed != null
                    ? (
                        locationWeather
                          .wind
                          .speed *
                        3.6
                      ).toFixed(1)
                    : "N/A"}{" "}
                  km/h
                </div>

                {/* PRESSURE */}

                <div>
                  <b>
                    🧭 Pressure
                  </b>

                  <br />

                  {locationWeather.main
                    ?.pressure ??
                    "N/A"}{" "}
                  hPa
                </div>

                {/* RAINFALL */}

                <div>
                  <b>
                    🌧️ Rainfall
                  </b>

                  <br />

                  {locationWeather
                    .rain?.["1h"] !=
                  null
                    ? `${locationWeather.rain["1h"]} mm`
                    : "0 mm"}
                </div>

                {/* CONDITION */}

                <div>
                  <b>
                    ☁️ Condition
                  </b>

                  <br />

                  {locationWeather
                    .weather?.[0]
                    ?.description
                    ? locationWeather.weather[0].description
                        .charAt(0)
                        .toUpperCase() +
                      locationWeather.weather[0].description.slice(
                        1
                      )
                    : "N/A"}
                </div>
              </>
            )}
          </div>

          {/* ERROR */}

          {locationError && (
            <div
              style={{
                marginTop: "10px",
                color: "#b91c1c",
                fontWeight:
                  "600",
              }}
            >
              ⚠️{" "}
              {locationError}
            </div>
          )}

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Click anywhere on the
            map to monitor another
            location.
          </div>
        </div>
      )}

      {/* ==================================
          ROUTE STATUS PANEL
      ================================== */}

      {(routeLoading ||
        routeCoordinates.length >
          0 ||
        routeError) && (
        <div
          style={{
            marginBottom: "12px",
            padding: "15px",
            background: "#f8fafc",
            border:
              "1px solid #cbd5e1",
            borderRadius: "12px",
          }}
        >
          {routeLoading && (
            <div
              style={{
                fontWeight: "700",
                color: "#1d4ed8",
              }}
            >
              🛣️ Finding best road
              route...
            </div>
          )}

          {!routeLoading &&
            routeStart &&
            routeDestination &&
            routeCoordinates.length >
              0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <b>
                      🛣️ Route Found
                    </b>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        marginTop:
                          "5px",
                        color:
                          "#475569",
                      }}
                    >
                      📍{" "}
                      {routeStart.name}
                      <br />
                      🏁{" "}
                      {
                        routeDestination.name
                      }
                    </div>
                  </div>

                  <button
                    onClick={
                      clearRoute
                    }
                    style={{
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #fecaca",
                      background:
                        "#fef2f2",
                      color:
                        "#b91c1c",
                      borderRadius:
                        "8px",
                      cursor:
                        "pointer",
                      fontWeight:
                        "600",
                    }}
                  >
                    ✕ Clear Route
                  </button>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "10px",
                    marginTop:
                      "12px",
                  }}
                >
                  <div
                    style={{
                      padding:
                        "10px",
                      background:
                        "#ffffff",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    🛣️ Road Route
                    <br />
                    <b>
                      Active
                    </b>
                  </div>

                  <div
                    style={{
                      padding:
                        "10px",
                      background:
                        "#ffffff",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    🔀 Alternatives
                    <br />
                    <b>
                      {
                        alternativeRoutes.length
                      }
                    </b>
                  </div>

                  <div
                    style={{
                      padding:
                        "10px",
                      background:
                        "#ffffff",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #e2e8f0",
                    }}
                  >
                    🌊 Flood Analysis
                    <br />
                    <b>
                      Next Step
                    </b>
                  </div>
                </div>

                <div
                  style={{
                    marginTop:
                      "10px",
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                  }}
                >
                  ℹ️ This route is
                  based on road
                  network data.
                  Live traffic and
                  flood-risk analysis
                  will be added in the
                  next step.
                </div>
              </>
            )}

          {routeError && (
            <div
              style={{
                color: "#b91c1c",
                fontWeight: "600",
              }}
            >
              ⚠️ {routeError}
            </div>
          )}
        </div>
      )}

      {/* ==================================
          MAP
      ================================== */}

      <MapContainer
        center={cityCenter}
        zoom={12}
        style={{
          height: "550px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        {/* CITY CHANGE */}

        <MapCityUpdater
          cityCenter={cityCenter}
        />

        {/* MAP CLICK */}

        <MapClickHandler
          onMapClick={
            handleMapClick
          }
        />

        {/* FIT ROUTE */}

        {routeCoordinates.length >
          1 && (
          <RouteMapFitter
            routeCoordinates={
              routeCoordinates
            }
          />
        )}

        {/* BASE MAP */}

        {mapMode ===
        "satellite" ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
        )}

        {/* WEATHER OVERLAY */}

        {activeWeatherLayer && (
          <TileLayer
            url={
              activeWeatherLayer
            }
            opacity={0.65}
          />
        )}

        {/* ==================================
            ALTERNATIVE ROUTES
        ================================== */}

        {alternativeRoutes.map(
          (route, index) => (
            <Polyline
              key={`alternative-${index}`}
              positions={route}
              pathOptions={{
                color: "#f59e0b",
                weight: 5,
                opacity: 0.55,
                dashArray: "8 8",
              }}
            />
          )
        )}

        {/* ==================================
            MAIN ROUTE
        ================================== */}

        {routeCoordinates.length >
          1 && (
          <Polyline
            positions={
              routeCoordinates
            }
            pathOptions={{
              color: "#2563eb",
              weight: 7,
              opacity: 0.9,
            }}
          >
            <Popup>
              <strong>
                🛣️ Recommended Road
                Route
              </strong>
              <br />
              Flood-risk analysis
              will be added in
              Step 3.
            </Popup>
          </Polyline>
        )}

        {/* ==================================
            START MARKER
        ================================== */}

        {routeStart && (
          <Marker
            position={[
              routeStart.lat,
              routeStart.lon,
            ]}
            icon={startIcon}
          >
            <Popup>
              <strong>
                🟢 Start
              </strong>
              <br />
              {routeStart.name}
            </Popup>
          </Marker>
        )}

        {/* ==================================
            DESTINATION MARKER
        ================================== */}

        {routeDestination && (
          <Marker
            position={[
              routeDestination.lat,
              routeDestination.lon,
            ]}
            icon={
              destinationIcon
            }
          >
            <Popup>
              <strong>
                🔴 Destination
              </strong>
              <br />
              {
                routeDestination.name
              }
            </Popup>
          </Marker>
        )}

        {/* ==================================
            SENSOR STATIONS
        ================================== */}

        {stations.map(
          (station) => (
            <Marker
              key={station.id}
              position={
                station.position
              }
              icon={sensorIcon}
            >
              <Popup>
                <strong>
                  📡{" "}
                  {station.id}
                </strong>

                <br />

                {station.name}

                <br />

                🌊 Water Level:{" "}
                <b>
                  {
                    station.waterLevel
                  }{" "}
                  m
                </b>
              </Popup>
            </Marker>
          )
        )}

        {/* ==================================
            MONITORING AREA
        ================================== */}

        <Circle
          center={cityCenter}
          radius={5000}
          pathOptions={{
            fillOpacity: 0.08,
          }}
        />
      </MapContainer>
    </div>
  );
}

export default FloodMap;