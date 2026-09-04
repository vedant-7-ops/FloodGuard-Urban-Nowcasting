const mongoose = require("mongoose");

const floodDataSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },

  rainfall: {
    type: Number,
    required: true
  },

  waterLevel: {
    type: Number,
    required: true
  },

  temperature: {
    type: Number,
    required: true
  },

  humidity: {
  type: Number
},

windSpeed: {
  type: Number
},

  risk: {
    type: String,
    enum: ["LOW", "MODERATE", "HIGH"],
    required: true
  },

  alertMessage: {
    type: String,
    required: true
  },

  sensorStatus: {
    type: String,
    default: "ONLINE"
  },

  recordedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("FloodData", floodDataSchema);