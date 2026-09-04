import { useState, useEffect, useRef } from "react";
import "./App.css";
import FloodMap from "./components/FloodMap";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:5000/api";

const cities = {
  Pune: {
    state: "Maharashtra",
    center: [18.5204, 73.8567],
    rainfall: 68,
    waterLevel: 2.4,
    temperature: 27,
  },

  Mumbai: {
    state: "Maharashtra",
    center: [19.076, 72.8777],
    rainfall: 82,
    waterLevel: 3.1,
    temperature: 29,
  },

  Delhi: {
    state: "Delhi",
    center: [28.6139, 77.209],
    rainfall: 54,
    waterLevel: 2.1,
    temperature: 31,
  },

  Chennai: {
    state: "Tamil Nadu",
    center: [13.0827, 80.2707],
    rainfall: 74,
    waterLevel: 2.7,
    temperature: 30,
  },
};

const sensorStations = {
  Pune: [
    ["PUN-01", "Water Level Sensor", "🌊"],
    ["PUN-02", "Rain Gauge", "🌧️"],
    ["PUN-03", "Weather Station", "🌡️"],
  ],

  Mumbai: [
    ["MUM-01", "Water Level Sensor", "🌊"],
    ["MUM-02", "Rain Gauge", "🌧️"],
    ["MUM-03", "Weather Station", "🌡️"],
  ],

  Delhi: [
    ["DEL-01", "Water Level Sensor", "🌊"],
    ["DEL-02", "Rain Gauge", "🌧️"],
    ["DEL-03", "Weather Station", "🌡️"],
  ],

  Chennai: [
    ["CHE-01", "Water Level Sensor", "🌊"],
    ["CHE-02", "Rain Gauge", "🌧️"],
    ["CHE-03", "Weather Station", "🌡️"],
  ],
};

const cityAlerts = {
  Pune: [
    {
      station: "PUN-01",
      risk: "MODERATE",
      message: "Water level is rising",
      time: "Just now",
    },
    {
      station: "PUN-02",
      risk: "MODERATE",
      message: "Heavy rainfall detected",
      time: "2 min ago",
    },
  ],

  Mumbai: [
    {
      station: "MUM-01",
      risk: "HIGH",
      message: "High flood risk detected",
      time: "Just now",
    },
    {
      station: "MUM-02",
      risk: "MODERATE",
      message: "Heavy rainfall detected",
      time: "3 min ago",
    },
  ],

  Delhi: [
    {
      station: "DEL-03",
      risk: "HIGH",
      message: "Critical water level detected",
      time: "Just now",
    },
    {
      station: "DEL-02",
      risk: "MODERATE",
      message: "Rainfall intensity increasing",
      time: "4 min ago",
    },
  ],

  Chennai: [
    {
      station: "CHE-02",
      risk: "HIGH",
      message: "Heavy rainfall detected",
      time: "Just now",
    },
    {
      station: "CHE-01",
      risk: "MODERATE",
      message: "Water level rising",
      time: "5 min ago",
    },
  ],
};

function App() {
  const [selectedCity, setSelectedCity] = useState("Pune");

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [rainfall, setRainfall] = useState(68);
  const [waterLevel, setWaterLevel] = useState(2.4);
  const [temperature, setTemperature] = useState(27);

  const [humidity, setHumidity] = useState(70);
  const [rainfallIntensity, setRainfallIntensity] =
    useState(50);

  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiRisk, setAiRisk] = useState("NOT CHECKED");

  const [sensorStatus, setSensorStatus] =
    useState("ONLINE");

  const [backendStatus, setBackendStatus] =
    useState("ONLINE");

  const [backendAlert, setBackendAlert] =
    useState("");

  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );

  const [forecast, setForecast] = useState([
    68,
    72,
    78,
    85,
    76,
    64,
  ]);

  const [alerts, setAlerts] = useState([]);

  const [selectedStation, setSelectedStation] =
    useState(null);

  /*
   * --------------------------------------------------
   * SAFE ROUTE STATES
   * --------------------------------------------------
   */

  const [startLocation, setStartLocation] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [routeResult, setRouteResult] =
    useState(null);

  const [routeRequest, setRouteRequest] =
    useState(null);

  /*
   * --------------------------------------------------
   * GENERATE FORECAST
   * --------------------------------------------------
   */

  const createForecast = (baseRainfall) => {
    const base = Number(baseRainfall) || 0;

    return Array.from(
      { length: 6 },
      (_, index) => {
        const variation =
          Math.floor(Math.random() * 21) - 10;

        const trend = index * 2;

        return Math.max(
          0,
          Math.round(
            base + variation + trend
          )
        );
      }
    );
  };

  /*
   * --------------------------------------------------
   * DYNAMIC CITY FORECAST
   * --------------------------------------------------
   */

  useEffect(() => {
    const city = cities[selectedCity];

    setRainfall(city.rainfall);
    setWaterLevel(city.waterLevel);
    setTemperature(city.temperature);

    setHumidity(70);

    setRainfallIntensity(
      Math.min(
        100,
        Math.round(city.rainfall)
      )
    );

    setSelectedStation(null);

    setLastUpdated(
      new Date().toLocaleTimeString()
    );

    const newForecast =
      createForecast(city.rainfall);

    setForecast(newForecast);
  }, [selectedCity]);

  /*
   * --------------------------------------------------
   * BACKEND FLOOD DATA
   * --------------------------------------------------
   */

  useEffect(() => {
    const fetchFloodData = () => {
      fetch(
        `${API_URL}/flood-data?city=${selectedCity}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Backend request failed"
            );
          }

          return response.json();
        })
        .then((data) => {
          console.log(
            "Live Backend Data:",
            data
          );

          if (data.rainfall !== undefined) {
            setRainfall(
              Number(data.rainfall)
            );
          }

          if (data.waterLevel !== undefined) {
            setWaterLevel(
              Number(data.waterLevel)
            );
          }

          if (data.temperature !== undefined) {
            setTemperature(
              Number(data.temperature)
            );
          }

          if (data.lastUpdated) {
            setLastUpdated(
              data.lastUpdated
            );
          }

          if (data.sensorStatus) {
            setSensorStatus(
              data.sensorStatus
            );
          }

          if (data.alertMessage) {
            setBackendAlert(
              data.alertMessage
            );
          }
        })
        .catch((error) => {
          console.error(
            "Backend connection failed:",
            error
          );
        });
    };

    fetchFloodData();

    const interval = setInterval(
      fetchFloodData,
      10000
    );

    return () =>
      clearInterval(interval);
  }, [selectedCity]);

  /*
   * --------------------------------------------------
   * BACKEND STATUS
   * --------------------------------------------------
   */

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Backend status request failed"
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "Backend Status:",
          data
        );

        setBackendStatus(
          data.status || "ONLINE"
        );
      })
      .catch((error) => {
        console.error(
          "Backend status failed:",
          error
        );

        setBackendStatus("OFFLINE");
      });
  }, []);

  /*
   * --------------------------------------------------
   * AI FLOOD PREDICTION
   * --------------------------------------------------
   */

  const getFloodPrediction = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/predict",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            rainfall: rainfall,
            water_level: waterLevel,
            temperature: temperature,
            humidity: humidity,
            rainfall_intensity:
              rainfallIntensity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "ML API request failed"
        );
      }

      const data =
        await response.json();

      console.log(
        "AI Prediction:",
        data
      );

      if (data.status === "success") {
        setAiRisk(
          data.prediction
        );

        setAiConfidence(
          data.confidence
        );
      }
    } catch (error) {
      console.error(
        "ML API connection failed:",
        error
      );

      setAiRisk("ML API OFFLINE");
      setAiConfidence(0);
    }
  };

  useEffect(() => {
    getFloodPrediction();
  }, [
    rainfall,
    waterLevel,
    temperature,
    humidity,
    rainfallIntensity,
  ]);

  /*
   * --------------------------------------------------
   * ALERT GENERATION
   * --------------------------------------------------
   */

  const generateAlert = (
    rain,
    water,
    stationId
  ) => {
    const numericRain =
      Number(rain) || 0;

    const numericWater =
      Number(water) || 0;

    if (
      numericRain >= 85 ||
      numericWater >= 3.5
    ) {
      return {
        id: Date.now(),
        station: stationId,
        risk: "HIGH",
        rainfall: numericRain,
        waterLevel: numericWater,
        message:
          "High flood risk detected",
        time:
          new Date().toLocaleTimeString(),
      };
    }

    if (
      numericRain >= 60 ||
      numericWater >= 2.5
    ) {
      return {
        id: Date.now(),
        station: stationId,
        risk: "MODERATE",
        rainfall: numericRain,
        waterLevel: numericWater,
        message:
          "Moderate flood risk detected",
        time:
          new Date().toLocaleTimeString(),
      };
    }

    return null;
  };

  const risk = aiRisk;

  /*
   * --------------------------------------------------
   * ALERT SOUND
   * --------------------------------------------------
   */

  const alertSoundRef =
    useRef(null);

  const testAlertSound = () => {
    if (alertSoundRef.current) {
      alertSoundRef.current.currentTime = 0;

      alertSoundRef.current
        .play()
        .then(() => {
          console.log(
            "🚨 SIREN PLAYING"
          );
        })
        .catch((error) => {
          console.error(
            "❌ SIREN ERROR:",
            error
          );
        });
    }
  };

  /*
   * --------------------------------------------------
   * MAP LOCATION SELECTION
   * --------------------------------------------------
   */

  const handleLocationSelect = (
    data
  ) => {
    console.log(
      "Selected Map Location:",
      data
    );

    const newRainfall =
      Number(data.rainfall) || 0;

    setRainfall(
      newRainfall
    );

    if (
      data.temperature !== undefined
    ) {
      setTemperature(
        Number(data.temperature)
      );
    }

    if (
      data.humidity !== undefined
    ) {
      setHumidity(
        Number(data.humidity)
      );
    }

    if (
      data.rainfallIntensity !==
      undefined
    ) {
      setRainfallIntensity(
        Number(
          data.rainfallIntensity
        )
      );
    }

    if (
      data.waterLevel !== undefined &&
      data.waterLevel !== null
    ) {
      setWaterLevel(
        Number(data.waterLevel)
      );
    }

    if (data.stationId) {
      setSelectedStation(
        data.stationId
      );
    } else {
      setSelectedStation(null);
    }

    const newForecast =
      createForecast(
        newRainfall
      );

    setForecast(
      newForecast
    );

    const alertWaterLevel =
      data.waterLevel !== undefined &&
      data.waterLevel !== null
        ? Number(data.waterLevel)
        : Number(waterLevel);

    const newAlert =
      generateAlert(
        newRainfall,
        alertWaterLevel,
        data.stationId || "MAP"
      );

    if (newAlert) {
      setAlerts((prev) => [
        newAlert,
        ...prev,
      ].slice(0, 5));

      setBackendAlert(
        newAlert.message
      );
    }

    setLastUpdated(
      new Date().toLocaleTimeString()
    );
  };

  /*
   * --------------------------------------------------
   * SAFE ROUTE ANALYSIS
   * --------------------------------------------------
   *
   * This function receives the actual road route
   * result from FloodMap.
   *
   * Traffic is an estimated prototype value.
   * Water level is based on current city monitoring.
   * Rainfall is based on current monitored rainfall.
   * Flood risk uses the same project thresholds.
   * --------------------------------------------------
   */

  const handleRouteResult = (routeData) => {
  if (!routeData) {
    setRouteResult(null);
    return;
  }

  console.log("Route Result Received:", routeData);

  if (routeData.success === false) {
    setRouteResult({
      success: false,
      traffic: "Unavailable",
      waterLevel: "Unavailable",
      rainfall: "Unavailable",
      floodRisk: "Unable to calculate",
      distance: "N/A",
      duration: "N/A",
    });

    return;
  }

  let routeDistance = 0;

  if (routeData.distanceKm !== undefined) {
    routeDistance = Number(routeData.distanceKm) || 0;
  } else if (routeData.distance !== undefined) {
    routeDistance = Number(routeData.distance) || 0;

    if (routeDistance > 100) {
      routeDistance = routeDistance / 1000;
    }
  }

  let routeDuration = 0;

  if (routeData.durationMin !== undefined) {
    routeDuration = Number(routeData.durationMin) || 0;
  } else if (routeData.duration !== undefined) {
    routeDuration = Number(routeData.duration) || 0;

    if (routeDuration > 180) {
      routeDuration = routeDuration / 60;
    }
  }

  const currentRain = Number(rainfall) || 0;

  let routeWaterLevel = Number(routeData.waterLevel);

  if (!Number.isFinite(routeWaterLevel)) {
    const cityWaterLevels = {
      Pune: [2.4, 2.1, 2.8],
      Mumbai: [3.1, 2.7, 2.5],
      Delhi: [2.2, 1.8, 2.4],
      Chennai: [2.6, 2.1, 2.5],
    };

    const levels =
      cityWaterLevels[selectedCity] || [
        Number(waterLevel) || 0,
      ];

    routeWaterLevel = Math.max(...levels);
  }

  let trafficLevel = "LOW";

  if (routeDistance > 20 || routeDuration > 45) {
    trafficLevel = "HIGH";
  } else if (routeDistance > 8 || routeDuration > 20) {
    trafficLevel = "MODERATE";
  }

  let routeFloodRisk = "LOW";

  if (currentRain >= 85 || routeWaterLevel >= 3.5) {
    routeFloodRisk = "HIGH";
  } else if (currentRain >= 60 || routeWaterLevel >= 2.5) {
    routeFloodRisk = "MODERATE";
  }

  setRouteResult({
    success: true,
    start: routeData.start,
    destination: routeData.destination,
    traffic: trafficLevel,
    waterLevel: `${routeWaterLevel.toFixed(1)} m`,
    rainfall: `${currentRain.toFixed(1)} mm`,
    floodRisk: routeFloodRisk,
    distance:
      routeDistance > 0
        ? `${routeDistance.toFixed(2)} km`
        : "N/A",
    duration:
      routeDuration > 0
        ? `${Math.round(routeDuration)} min`
        : "N/A",
    alternatives: routeData.alternatives || 0,
  });
};

  /*
   * --------------------------------------------------
   * SAFE ROUTE SEARCH
   * --------------------------------------------------
   */

  const findSafeRoute = () => {
    if (
      !startLocation.trim() ||
      !destination.trim()
    ) {
      alert(
        "Please enter starting location and destination."
      );
      return;
    }

    /*
     * Show temporary loading state
     * until FloodMap returns route data.
     */

    setRouteResult({
      traffic:
        "Finding route...",

      waterLevel:
        "Checking...",

      rainfall:
        "Checking...",

      floodRisk:
        "Calculating...",

      distance:
        "Calculating...",

      duration:
        "Calculating...",
    });

    /*
     * Request actual route from FloodMap.
     */

    setRouteRequest({
      start:
        startLocation.trim(),

      destination:
        destination.trim(),

      requestId:
        Date.now(),
    });
  };

  /*
   * --------------------------------------------------
   * PIE CHART DATA
   * --------------------------------------------------
   */

  const rainfallDistribution = [
    {
      name: "Low",
      value:
        forecast.filter(
          (value) =>
            Number(value) < 40
        ).length,
    },

    {
      name: "Moderate",
      value:
        forecast.filter(
          (value) =>
            Number(value) >= 40 &&
            Number(value) < 70
        ).length,
    },

    {
      name: "Heavy",
      value:
        forecast.filter(
          (value) =>
            Number(value) >= 70
        ).length,
    },
  ];

  const pieColors = [
    "#22c55e",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="app">

      <audio
        ref={alertSoundRef}
        src="/nuclear-siren.mp3"
        preload="auto"
      />

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logoIcon">
            🌊
          </div>

          <div>
            <h2>FloodGuard</h2>

            <span>
              Urban Nowcasting
            </span>
          </div>

        </div>

        <nav>

          <a
            className={
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            ▦ Dashboard
          </a>

          <a
            className={
              activeSection ===
              "map"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "map"
              );

              document
                .getElementById(
                  "flood-map"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            🗺️ Flood Map
          </a>

          {/* SAFE ROUTE */}

          <a
            className={
              activeSection ===
              "safe-route"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "safe-route"
              );

              document
                .getElementById(
                  "safe-route"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            🛣️ Safe Route
          </a>

          <a
            className={
              activeSection ===
              "business"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "business"
              );

              document
                .getElementById(
                  "business-model"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            💼 Business Model
          </a>

          <a
            className={
              activeSection ===
              "rainfall"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "rainfall"
              );

              document
                .getElementById(
                  "rainfall-forecast"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            🌧️ Rainfall
          </a>

          <a
            className={
              activeSection ===
              "analytics"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "analytics"
              );

              document
                .getElementById(
                  "analytics"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            📊 Analytics
          </a>

          <a
            className={
              activeSection ===
              "alerts"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "alerts"
              );

              document
                .getElementById(
                  "recent-alerts"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            ⚠️ Alerts
          </a>

          <a
            className={
              activeSection ===
              "settings"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveSection(
                "settings"
              );

              document
                .getElementById(
                  "settings"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                });
            }}
          >
            ⚙️ Settings
          </a>

        </nav>

        <div className="systemStatus">

          <span className="statusDot"></span>

          <div>

            <strong>
              System{" "}
              {backendStatus ===
              "ONLINE"
                ? "Online"
                : "Offline"}
            </strong>

            <small>
              {sensorStatus ===
              "ONLINE"
                ? "All sensors connected"
                : "Sensor connection issue"}
            </small>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div>

            <p className="smallTitle">
              REAL-TIME MONITORING
            </p>

            <h1>
              Urban Flood Dashboard
            </h1>

            <p className="subtitle">
              Monitor rainfall,
              water levels and
              flood risk in real
              time.
            </p>

          </div>

          <div className="headerRight">

            <div className="location">

              📍

              <div>

                <strong>
                  {selectedCity},{" "}
                  {
                    cities[
                      selectedCity
                    ].state
                  }
                </strong>

                <small>
                  India
                </small>

                {selectedStation && (
                  <small className="selectedStation">
                    📡 Monitoring:{" "}
                    {selectedStation}
                  </small>
                )}

              </div>

            </div>

            <div className="live">

              <span className="liveDot"></span>

              LIVE

            </div>

            <small className="lastUpdated">
              Last updated:{" "}
              {lastUpdated}
            </small>

          </div>

        </header>

        {/* AI BUTTON */}

        <button
          onClick={
            getFloodPrediction
          }
          style={{
            marginBottom:
              "15px",
            padding:
              "10px 16px",
            border: "none",
            borderRadius:
              "8px",
            background:
              "#1677ff",
            color: "white",
            cursor:
              "pointer",
          }}
        >
          🤖 Check AI Flood Risk
        </button>

        {/* AI RESULT */}

        <div
          className="aiPrediction"
          style={{
            marginBottom:
              "18px",
            fontSize:
              "14px",
          }}
        >
          🧠 AI Prediction:{" "}
          <strong>
            {aiRisk}
          </strong>

          {" | "}

          Confidence:{" "}
          <strong>
            {aiConfidence}%
          </strong>
        </div>

        {/* SIREN */}

        <button
          onClick={
            testAlertSound
          }
          style={{
            marginBottom:
              "18px",
            padding:
              "10px 18px",
            border: "none",
            borderRadius:
              "8px",
            background:
              "#dc2626",
            color: "white",
            cursor:
              "pointer",
            fontWeight:
              "600",
          }}
        >
          🚨 TEST FLOOD SIREN
        </button>

        {/* ALERT */}

        <section
          className={`alertBanner ${risk.toLowerCase()}`}
        >

          <div className="alertIcon">
            ⚠️
          </div>

          <div>

            <strong>
              {risk ===
              "HIGH"
                ? "High Flood Risk Detected"
                : risk ===
                  "MODERATE"
                ? "Moderate Flood Risk"
                : risk ===
                  "LOW"
                ? "Low Flood Risk"
                : "AI Risk Assessment"}
            </strong>

            <p>
              {backendAlert ||
                "System is monitoring flood conditions."}
            </p>

          </div>

          <button>
            View Alert
          </button>

        </section>

        {/* STATS */}

        <section className="statsGrid">

          <div className="statCard">

            <div className="cardTop">
              <span>🌧️</span>
              <small>
                Rainfall
              </small>
            </div>

            <h2>
              {rainfall}{" "}
              <em>mm</em>
            </h2>

            <div className="progress">

              <div
                style={{
                  width: `${Math.min(
                    Number(rainfall) || 0,
                    100
                  )}%`,
                }}
              ></div>

            </div>

            <p>
              Last 24 hours
            </p>

          </div>

          <div className="statCard">

            <div className="cardTop">
              <span>🌊</span>
              <small>
                Water Level
              </small>
            </div>

            <h2>
              {waterLevel}{" "}
              <em>m</em>
            </h2>

            <p>
              River monitoring
              station
            </p>

          </div>

          <div className="statCard">

            <div className="cardTop">
              <span>⚠️</span>
              <small>
                Flood Risk
              </small>
            </div>

            <h2
              className={`riskText ${risk.toLowerCase()}`}
            >
              {risk}
            </h2>

            <p>
              AI-based risk
              assessment
            </p>

            <p>
              AI Confidence:{" "}
              <strong>
                {aiConfidence}%
              </strong>
            </p>

          </div>

          <div className="statCard">

            <div className="cardTop">
              <span>🌡️</span>
              <small>
                Temperature
              </small>
            </div>

            <h2>
              {temperature}{" "}
              <em>°C</em>
            </h2>

            <p>
              Current temperature
            </p>

          </div>

        </section>

        {/* MAP + FORECAST */}

        <section
          className="contentGrid"
          id="flood-map"
        >

          {/* MAP */}

          <div className="panel">

            <div className="panelHeader">

              <div>

                <h3>
                  Flood Risk Map
                </h3>

                <p>
                  Urban flood
                  monitoring area
                </p>

              </div>

              <select
                value={
                  selectedCity
                }
                onChange={(e) =>
                  setSelectedCity(
                    e.target.value
                  )
                }
              >

                {Object.keys(
                  cities
                ).map(
                  (city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  )
                )}

              </select>

            </div>

            <FloodMap
              cityCenter={
                cities[
                  selectedCity
                ].center
              }
              selectedCity={
                selectedCity
              }
              onLocationSelect={
                handleLocationSelect
              }
              routeRequest={routeRequest}
              onRouteResult={
                handleRouteResult
              }
            />

          </div>

          {/* FORECAST */}

          <div
            className="panel"
            id="rainfall-forecast"
          >

            <div className="panelHeader">

              <div>

                <h3>
                  Rainfall Forecast
                </h3>

                <p>
                  Next 6 hours
                </p>

              </div>

              <span className="forecastIcon">
                🌧️
              </span>

            </div>

            {/* BAR GRAPH */}

            <div className="forecastChart">

              {forecast.map(
                (
                  value,
                  index
                ) => (

                  <div
                    key={index}
                    className="forecastBar"
                    style={{
                      height: `${Math.min(
                        Math.max(
                          Number(value),
                          10
                        ),
                        100
                      )}%`,
                    }}
                    title={`${value} mm`}
                  >
                    <span>
                      {value}
                    </span>
                  </div>

                )
              )}

            </div>

            <div className="forecastLabels">

              <span>
                Now
              </span>

              <span>
                +1h
              </span>

              <span>
                +2h
              </span>

              <span>
                +3h
              </span>

              <span>
                +4h
              </span>

              <span>
                +5h
              </span>

            </div>

            {/* PIE CHART */}

            <div
              className="rainfallPieChart"
              style={{
                marginTop:
                  "25px",
                paddingTop:
                  "20px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >

              <div
                style={{
                  textAlign:
                    "center",
                  marginBottom:
                    "5px",
                }}
              >

                <h4
                  style={{
                    margin:
                      "0",
                    fontSize:
                      "17px",
                  }}
                >
                  Rainfall
                  Distribution
                </h4>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize:
                      "13px",
                    color:
                      "#6b7280",
                  }}
                >
                  Next 6 hours
                  rainfall
                  intensity
                </p>

              </div>

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <PieChart>

                  <Pie
                    data={
                      rainfallDistribution
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    innerRadius={35}
                    paddingAngle={3}
                    label
                  >

                    {rainfallDistribution.map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            pieColors[
                              index
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </section>

        {/* ==================================================
            SAFE ROUTE SECTION
           ================================================== */}

        <section
          className="panel"
          id="safe-route"
          style={{
            marginBottom: "24px",
          }}
        >

          <div className="panelHeader">

            <div>

              <h3>
                🛣️ Flood-Aware Safe Route
              </h3>

              <p>
                Find a safer route using
                flood and environmental
                conditions
              </p>

            </div>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginTop: "18px",
            }}
          >

            {/* START LOCATION */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                📍 Starting Location
              </label>

              <input
                type="text"
                value={
                  startLocation
                }
                onChange={(e) =>
                  setStartLocation(
                    e.target.value
                  )
                }
                placeholder="Enter starting location"
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  fontSize:
                    "14px",
                  boxSizing:
                    "border-box",
                }}
              />

            </div>

            {/* DESTINATION */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                🏁 Destination
              </label>

              <input
                type="text"
                value={
                  destination
                }
                onChange={(e) =>
                  setDestination(
                    e.target.value
                  )
                }
                placeholder="Enter destination"
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  fontSize:
                    "14px",
                  boxSizing:
                    "border-box",
                }}
              />

            </div>

          </div>

          {/* FIND ROUTE BUTTON */}

          <button
            onClick={
              findSafeRoute
            }
            style={{
              marginTop: "18px",
              padding:
                "12px 20px",
              border: "none",
              borderRadius:
                "8px",
              background:
                "#1677ff",
              color:
                "#ffffff",
              cursor:
                "pointer",
              fontWeight:
                "600",
              fontSize:
                "14px",
            }}
          >
            🔍 Find Safe Route
          </button>

          {/* ROUTE ANALYSIS */}

          {routeResult && (
            <div
              style={{
                marginTop:
                  "20px",
                padding:
                  "18px",
                borderRadius:
                  "12px",
                background:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
              }}
            >

              <h4
                style={{
                  marginTop: 0,
                  marginBottom:
                    "5px",
                }}
              >
                🧠 Route Environmental
                Analysis
              </h4>

              <p
                style={{
                  marginTop: 0,
                  color:
                    "#64748b",
                  fontSize:
                    "13px",
                }}
              >
                {startLocation}
                {" → "}
                {destination}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "12px",
                  marginTop:
                    "15px",
                }}
              >

                {/* TRAFFIC */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  🚗{" "}
                  <strong>
                    Traffic
                  </strong>

                  <br />

                  <span>
                    {routeResult.traffic}
                  </span>
                </div>

                {/* WATER LEVEL */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  🌊{" "}
                  <strong>
                    Water Level
                  </strong>

                  <br />

                  <span>
                    {routeResult.waterLevel}
                  </span>
                </div>

                {/* RAINFALL */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  🌧️{" "}
                  <strong>
                    Rainfall
                  </strong>

                  <br />

                  <span>
                    {routeResult.rainfall}
                  </span>
                </div>

                {/* FLOOD RISK */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  ⚠️{" "}
                  <strong>
                    Flood Risk
                  </strong>

                  <br />

                  <span>
                    {routeResult.floodRisk}
                  </span>
                </div>

                {/* DISTANCE */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  📏{" "}
                  <strong>
                    Distance
                  </strong>

                  <br />

                  <span>
                    {routeResult.distance ||
                      "Calculating..."}
                  </span>
                </div>

                {/* ESTIMATED TIME */}

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  ⏱️{" "}
                  <strong>
                    Estimated Time
                  </strong>

                  <br />

                  <span>
                    {routeResult.duration ||
                      "Calculating..."}
                  </span>
                </div>

              </div>

              {/* ROUTE ANALYSIS NOTE */}

              <p
                style={{
                  marginTop:
                    "14px",
                  marginBottom: 0,
                  fontSize:
                    "12px",
                  color:
                    "#64748b",
                }}
              >
                ℹ️ Traffic and water-level
                values are prototype estimates
                based on current monitoring data.
              </p>

            </div>
          )}

        </section>

        {/* ==================================================
             BUSINESS MODEL SECTION
           ================================================== */}

        <section
          className="panel"
          id="business-model"
          style={{
            marginBottom: "24px",
          }}
        >

          <div className="panelHeader">

            <div>

              <h3>
                💼 FloodGuard Business Model
              </h3>

              <p>
                Scalable solutions for citizens,
                businesses and government organizations
              </p>

            </div>

          </div>

          {/* BUSINESS PLANS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "18px",
            }}
          >

            {/* FREE */}

            <div
              style={{
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                background: "#ffffff",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                🆓
              </div>

              <h3 style={{ margin: "10px 0 6px" }}>
                Free
              </h3>

              <h2 style={{ margin: "0 0 12px" }}>
                ₹0
              </h2>

              <p style={{ color: "#64748b", fontSize: "13px" }}>
                Basic flood awareness for individual users.
              </p>

              <ul
                style={{
                  paddingLeft: "20px",
                  lineHeight: "1.8",
                  fontSize: "13px",
                }}
              >
                <li>Basic Flood Risk</li>
                <li>Flood Map</li>
                <li>Basic Environmental Data</li>
              </ul>
            </div>

            {/* PREMIUM */}

            <div
              style={{
                padding: "20px",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                background: "#eff6ff",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                ⭐
              </div>

              <h3 style={{ margin: "10px 0 6px" }}>
                Premium
              </h3>

              <h2 style={{ margin: "0 0 12px" }}>
                ₹999
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "400",
                    color: "#64748b",
                  }}
                >
                  {" "}/ month
                </span>
              </h2>

              <p style={{ color: "#475569", fontSize: "13px" }}>
                Advanced monitoring and route intelligence.
              </p>

              <ul
                style={{
                  paddingLeft: "20px",
                  lineHeight: "1.8",
                  fontSize: "13px",
                }}
              >
                <li>Advanced Safe Route</li>
                <li>Flood & Environmental Alerts</li>
                <li>Route Risk Analysis</li>
                <li>Advanced Analytics</li>
              </ul>
            </div>

            {/* ENTERPRISE */}

            <div
              style={{
                padding: "20px",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                background: "#f8fafc",
              }}
            >
              <div style={{ fontSize: "28px" }}>
                🏢
              </div>

              <h3 style={{ margin: "10px 0 6px" }}>
                Enterprise
              </h3>

              <h2 style={{ margin: "0 0 12px" }}>
                Custom
              </h2>

              <p style={{ color: "#64748b", fontSize: "13px" }}>
                Dedicated flood intelligence for organizations.
              </p>

              <ul
                style={{
                  paddingLeft: "20px",
                  lineHeight: "1.8",
                  fontSize: "13px",
                }}
              >
                <li>Municipal Flood Monitoring</li>
                <li>Industry & Infrastructure Monitoring</li>
                <li>Fleet / Logistics Route Intelligence</li>
                <li>API & Custom Dashboard</li>
              </ul>
            </div>

          </div>

          {/* TARGET CUSTOMERS + REVENUE */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              marginTop: "18px",
            }}
          >

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <h4 style={{ marginTop: 0 }}>
                🎯 Target Customers
              </h4>

              <p style={{ fontSize: "13px", lineHeight: "1.8" }}>
                🏙️ Municipal Corporations
                <br />
                🏢 Industries & Businesses
                <br />
                🏗️ Construction Companies
                <br />
                🚚 Logistics & Fleet Operators
                <br />
                👥 Individual Users
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <h4 style={{ marginTop: 0 }}>
                📈 Revenue Model
              </h4>

              <p style={{ fontSize: "13px", lineHeight: "1.8" }}>
                💳 Premium Subscriptions
                <br />
                🏛️ Government / Municipal Contracts
                <br />
                🏢 Enterprise Subscriptions
                <br />
                🔌 API / Data Services
              </p>
            </div>

          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: "13px",
              color: "#166534",
            }}
          >
            💡 <strong>Business Value:</strong>{" "}
            FloodGuard can help organizations make faster
            flood-response and route-planning decisions using
            environmental monitoring, ML-based risk prediction
            and flood-aware navigation.
          </div>

          <p
            style={{
              marginTop: "12px",
              marginBottom: 0,
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            ℹ️ Pricing shown here is a prototype business-model
            example for the project demonstration.
          </p>

        </section>

        {/* RECENT ALERTS */}

        <section
          className="panel recentAlerts"
          id="recent-alerts"
        >

          <div className="panelHeader">

            <div>

              <h3>
                🚨 Recent Alerts
              </h3>

              <p>
                Latest flood risk
                notifications
              </p>

            </div>

          </div>

          {cityAlerts[
            selectedCity
          ].map(
            (
              alert,
              index
            ) => (

              <div
                className="alertItem"
                key={index}
              >

                <div className="alertItemIcon">

                  {alert.risk ===
                  "HIGH"
                    ? "🔴"
                    : "🟠"}

                </div>

                <div className="alertItemInfo">

                  <strong>
                    {alert.risk}{" "}
                    Flood Risk —{" "}
                    {alert.station}
                  </strong>

                  <small>
                    {alert.message}
                  </small>

                  <small>
                    {alert.time}
                  </small>

                </div>

                <span className="alertRisk">
                  {alert.risk}
                </span>

              </div>

            )
          )}

          {alerts.length >
            0 && (

            <div className="alertList">

              {alerts.map(
                (alert) => (

                  <div
                    className={`alertItem ${alert.risk.toLowerCase()}`}
                    key={
                      alert.id
                    }
                  >

                    <div className="alertItemIcon">

                      {alert.risk ===
                      "HIGH"
                        ? "🚨"
                        : "⚠️"}

                    </div>

                    <div className="alertItemInfo">

                      <strong>
                        {alert.risk ===
                        "HIGH"
                          ? "High Flood Risk Detected"
                          : "Moderate Flood Risk"}
                      </strong>

                      <small>
                        🌧️ Rainfall:{" "}
                        {
                          alert.rainfall
                        }{" "}
                        mm
                        {" | "}
                        🌊 Water
                        Level:{" "}
                        {
                          alert.waterLevel
                        }{" "}
                        m
                      </small>

                      <small>
                        🕒{" "}
                        {
                          alert.time
                        }
                      </small>

                    </div>

                    <span className="alertRisk">
                      {
                        alert.risk
                      }
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* BOTTOM GRID */}

        <section className="bottomGrid">

          <div className="panel">

            <div className="panelHeader">

              <div>

                <h3>
                  Sensor Network
                </h3>

                <p>
                  Live sensor status
                </p>

              </div>

            </div>

            {sensorStations[
              selectedCity
            ].map(
              (sensor) => (

                <div
                  className="sensor"
                  key={
                    sensor[0]
                  }
                >

                  <span>
                    {
                      sensor[2]
                    }
                  </span>

                  <div>

                    <strong>
                      {
                        sensor[1]
                      }
                    </strong>

                    <small>
                      Station{" "}
                      {
                        sensor[0]
                      }
                    </small>

                  </div>

                  <b>
                    ●{" "}
                    {
                      sensorStatus
                    }
                  </b>

                </div>

              )
            )}

          </div>

          <div className="panel">

            <div className="panelHeader">

              <div>

                <h3>
                  Flood Risk
                  Indicators
                </h3>

                <p>
                  Current
                  environmental
                  conditions
                </p>

              </div>

            </div>

            <div className="indicator">

              <div>

                <span>
                  Rainfall
                  Intensity
                </span>

                <strong>
                  {rainfallIntensity}%
                </strong>

              </div>

              <div className="indicatorBar">

                <div
                  style={{
                    width: `${Math.min(
                      Number(
                        rainfallIntensity
                      ) || 0,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

            </div>

            <div className="indicator">

              <div>

                <span>
                  Water Level
                </span>

                <strong>
                  {waterLevel} m
                </strong>

              </div>

              <div className="indicatorBar">

                <div
                  style={{
                    width: `${Math.min(
                      (Number(
                        waterLevel
                      ) || 0) * 20,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

            </div>

            <div className="indicator">

              <div>

                <span>
                  Drainage
                  Capacity
                </span>

                <strong>
                  72%
                </strong>

              </div>

              <div className="indicatorBar">

                <div
                  style={{
                    width:
                      "72%",
                  }}
                ></div>

              </div>

            </div>

          </div>

        </section>

        {/* ANALYTICS */}

        <section
          className="analyticsSection"
          id="analytics"
        >

          <div className="modelEvaluation">

            <div className="panelHeader">

              <div>

                <h3>
                  🤖 Model
                  Evaluation
                </h3>

                <p>
                  Random Forest
                  flood-risk
                  classification
                  performance
                </p>

              </div>

            </div>

            <div className="evaluationGrid">

              <div className="evaluationCard">
                <span>🎯</span>
                <small>
                  Accuracy
                </small>
                <strong>
                  100%
                </strong>
              </div>

              <div className="evaluationCard">
                <span>📌</span>
                <small>
                  Precision
                </small>
                <strong>
                  100%
                </strong>
              </div>

              <div className="evaluationCard">
                <span>🔍</span>
                <small>
                  Recall
                </small>
                <strong>
                  100%
                </strong>
              </div>

              <div className="evaluationCard">
                <span>📊</span>
                <small>
                  F1 Score
                </small>
                <strong>
                  100%
                </strong>
              </div>

            </div>

            <div className="confusionMatrix">

              <h4>
                Confusion Matrix
              </h4>

              <table>

                <thead>

                  <tr>
                    <th>
                      Actual /
                      Predicted
                    </th>

                    <th>
                      LOW
                    </th>

                    <th>
                      MODERATE
                    </th>

                    <th>
                      HIGH
                    </th>
                  </tr>

                </thead>

                <tbody>

                  <tr>
                    <th>
                      LOW
                    </th>

                    <td>
                      2
                    </td>

                    <td>
                      0
                    </td>

                    <td>
                      0
                    </td>
                  </tr>

                  <tr>
                    <th>
                      MODERATE
                    </th>

                    <td>
                      0
                    </td>

                    <td>
                      2
                    </td>

                    <td>
                      0
                    </td>
                  </tr>

                  <tr>
                    <th>
                      HIGH
                    </th>

                    <td>
                      0
                    </td>

                    <td>
                      0
                    </td>

                    <td>
                      2
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>

          {/* FEATURE IMPORTANCE */}

          <div className="featureImportance">

            <div className="panelHeader">

              <div>

                <h3>
                  🧠 AI Feature
                  Importance
                </h3>

                <p>
                  Factors
                  influencing
                  flood risk
                  prediction
                </p>

              </div>

            </div>

            <div className="featureList">

              <div className="featureItem">

                <div>

                  <span>
                    🌧️ Rainfall
                  </span>

                  <strong>
                    27.26%
                  </strong>

                </div>

                <div className="featureBar">

                  <div
                    style={{
                      width:
                        "27.26%",
                    }}
                  ></div>

                </div>

              </div>

              <div className="featureItem">

                <div>

                  <span>
                    💧 Water Level
                  </span>

                  <strong>
                    21.44%
                  </strong>

                </div>

                <div className="featureBar">

                  <div
                    style={{
                      width:
                        "21.44%",
                    }}
                  ></div>

                </div>

              </div>

              <div className="featureItem">

                <div>

                  <span>
                    🌡️ Temperature
                  </span>

                  <strong>
                    1.05%
                  </strong>

                </div>

                <div className="featureBar">

                  <div
                    style={{
                      width:
                        "1.05%",
                    }}
                  ></div>

                </div>

              </div>

              <div className="featureItem">

                <div>

                  <span>
                    💦 Humidity
                  </span>

                  <strong>
                    25.61%
                  </strong>

                </div>

                <div className="featureBar">

                  <div
                    style={{
                      width:
                        "25.61%",
                    }}
                  ></div>

                </div>

              </div>

              <div className="featureItem">

                <div>

                  <span>
                    🌧️ Rainfall
                    Intensity
                  </span>

                  <strong>
                    24.64%
                  </strong>

                </div>

                <div className="featureBar">

                  <div
                    style={{
                      width:
                        "24.64%",
                    }}
                  ></div>

                </div>

              </div>

            </div>

          </div>

          {/* ANALYTICS CARDS */}

          <div className="analyticsGrid">

            <div className="analyticsCard">

              <span>
                🌧️
              </span>

              <div>

                <small>
                  Rainfall
                </small>

                <strong>
                  {rainfall} mm
                </strong>

              </div>

            </div>

            <div className="analyticsCard">

              <span>
                🌊
              </span>

              <div>

                <small>
                  Water Level
                </small>

                <strong>
                  {waterLevel} m
                </strong>

              </div>

            </div>

            <div className="analyticsCard">

              <span>
                🌡️
              </span>

              <div>

                <small>
                  Temperature
                </small>

                <strong>
                  {temperature} °C
                </strong>

              </div>

            </div>

            <div className="analyticsCard">

              <span>
                ⚠️
              </span>

              <div>

                <small>
                  Current Risk
                </small>

                <strong>
                  {risk}
                </strong>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="analyticsSummary">

            <h4>
              Monitoring Summary
            </h4>

            <p>
              🏙️ City:
              <strong>
                {" "}
                {selectedCity}
              </strong>
            </p>

            <p>
              📡 Station:
              <strong>
                {" "}
                {selectedStation ||
                  "City Monitoring"}
              </strong>
            </p>

            <p>
              🕒 Monitoring Status:
              <strong>
                {" "}
                LIVE
              </strong>
            </p>

          </div>

        </section>

        {/* SETTINGS */}

        <section
          className="settingsSection"
          id="settings"
        >

          <div className="panelHeader">

            <div>

              <h3>
                ⚙️ System Settings
              </h3>

              <p>
                Urban Flood
                Monitoring
                Configuration
              </p>

            </div>

          </div>

          <div className="settingsGrid">

            <div className="settingItem">

              <span>
                📡 Sensor Network
              </span>

              <strong>
                ● All Sensors
                Online
              </strong>

            </div>

            <div className="settingItem">

              <span>
                🔄 Data Monitoring
              </span>

              <strong>
                ● Real-time
              </strong>

            </div>

            <div className="settingItem">

              <span>
                🚨 Alert System
              </span>

              <strong>
                ● Enabled
              </strong>

            </div>

            <div className="settingItem">

              <span>
                🧠 AI Risk
                Assessment
              </span>

              <strong>
                ● Enabled
              </strong>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer>

          <span>
            © 2026 Urban Flood
            Nowcasting System
          </span>

          <span>
            System Status:{" "}
            {backendStatus ===
            "ONLINE"
              ? "Online"
              : "Offline"}
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;