const mongoose = require('mongoose');

/**
 * VipIncident — stores AI-generated incident map data produced by the Ollama worker.
 * Updated every 30 minutes alongside VipInsights.
 */
const vipIncidentSchema = new mongoose.Schema(
  {
    incidents: {
      type: [
        {
          id:          { type: Number },
          name:        { type: String },
          location:    { type: String },
          pos:         { type: [Number] }, // [lat, lng]
          type:        { type: String, enum: ['alert', 'warn', 'safe'], default: 'warn' },
          desc:        { type: String },
          sourceType:  { type: String }, // 'flood', 'violence', 'earthquake', etc.
          severity:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
        },
      ],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    headlineCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VipIncident', vipIncidentSchema, 'VipIncidents');
