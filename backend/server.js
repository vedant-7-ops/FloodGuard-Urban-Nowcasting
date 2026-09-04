const axios = require("axios");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const FloodData = require("./models/FloodData");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/floodguard")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// ===============================
// FLOOD DATA
// ===============================

const floodData = {
  Pune: {
    city: "Pune",
    rainfall: 68,
    waterLevel: 2.4,
    temperature: 27
  },

  Mumbai: {
    city: "Mumbai",
    rainfall: 82,
    waterLevel: 3.1,
    temperature: 29
  },

  Delhi: {
    city: "Delhi",
    rainfall: 54,
    waterLevel: 2.1,
    temperature: 31
  },

  Chennai: {
    city: "Chennai",
    rainfall: 74,
    waterLevel: 2.7,
    temperature: 30
  }
};

// ===============================
// REAL WEATHER API
// ===============================

app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city || "Pune";

    const locations = {
      Pune: { latitude: 18.5204, longitude: 73.8567 },
      Mumbai: { latitude: 19.0760, longitude: 72.8777 },
      Delhi: { latitude: 28.6139, longitude: 77.2090 },
      Chennai: { latitude: 13.0827, longitude: 80.2707 }
    };

    const location = locations[city];

    if (!location) {
      return res.status(404).json({
        error: "City not found"
      });
    }

    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
          timezone: "Asia/Kolkata"
        }
      }
    );

    const weatherData = response.data.current;

console.log("Real Weather Data:", weatherData);

const weatherRecord = new FloodData({
  city: city,
  rainfall: weatherData.precipitation || 0,
  waterLevel: 0,
  temperature: weatherData.temperature_2m,
  humidity: weatherData.relative_humidity_2m,
  windSpeed: weatherData.wind_speed_10m,
  risk: "LOW",
  alertMessage: "Weather data received",
  sensorStatus: "ONLINE"
});

await weatherRecord.save();

console.log(`Real weather data saved for ${city}`);

    res.json({
      city: city,
      temperature: response.data.current.temperature_2m,
      humidity: response.data.current.relative_humidity_2m,
      rainfall: response.data.current.precipitation,
      windSpeed: response.data.current.wind_speed_10m,
      time: response.data.current.time
    });

  } catch (error) {
    console.error("Weather API Error:", error.message);

    res.status(500).json({
      error: "Unable to fetch weather data"
    });
  }
});

// ===============================
// HEALTH API
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "FloodGuard Backend is running!"
  });
});


// ===============================
// SYSTEM STATUS API
// ===============================

app.get("/api/status", (req, res) => {
  res.json({
    system: "FloodGuard",
    status: "ONLINE",
    sensors: "ONLINE",
    backend: "RUNNING",
    timestamp: new Date().toLocaleTimeString()
  });
});


// ===============================
// FLOOD DATA API
// ===============================

app.get("/api/flood-data", (req, res) => {

  const city = req.query.city || "Pune";

  const data = floodData[city];

  if (!data) {
    return res.status(404).json({
      error: "City not found"
    });
  }


  // Simulated live sensor data

  const rainfall = Math.max(
    0,
    Math.round(
      data.rainfall + (Math.random() * 10 - 5)
    )
  );


  const waterLevel = Math.max(
    0,
    Number(
      (
        data.waterLevel +
        (Math.random() * 0.4 - 0.2)
      ).toFixed(2)
    )
  );


  const temperature = Math.round(
    data.temperature + (Math.random() * 2 - 1)
  );


  // ===============================
  // AUTOMATIC RISK CALCULATION
  // ===============================

  let risk = "LOW";

  if (rainfall >= 85 || waterLevel >= 3.5) {

    risk = "HIGH";

  } else if (rainfall >= 60 || waterLevel >= 2.5) {

    risk = "MODERATE";

  }


  // ===============================
  // AUTOMATIC ALERT
  // ===============================

  let alertMessage = "No immediate flood risk";

  if (risk === "HIGH") {

    alertMessage = "High flood risk detected";

  } else if (risk === "MODERATE") {

    alertMessage = "Moderate flood risk detected";

  }

  // Save flood data to MongoDB
const newFloodData = new FloodData({
  city: data.city,
  rainfall: rainfall,
  waterLevel: waterLevel,
  temperature: temperature,
  risk: risk,
  alertMessage: alertMessage,
  sensorStatus: "ONLINE"
});

newFloodData.save()
  .then(() => {
    console.log(`Flood data saved for ${data.city}`);
  })
  .catch((error) => {
    console.error("Database save failed:", error.message);
  });

  // ===============================
  // SEND RESPONSE
  // ===============================

  res.json({

    city: data.city,

    rainfall: rainfall,

    waterLevel: waterLevel,

    temperature: temperature,

    risk: risk,

    alertMessage: alertMessage,

    sensorStatus: "ONLINE",

    lastUpdated: new Date().toLocaleTimeString()

  });

});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `FloodGuard Backend running on http://localhost:${PORT}`
  );

});