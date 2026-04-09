const mongoose = require('mongoose');

/**
 * VipInsight — stores AI-generated summaries produced by the local Ollama worker.
 * One document per category (national, sports, economy, etc.)
 * Upserted every 30 minutes by ollamaWorker.js
 */
const vipInsightSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true, // one insight record per category
      index: true,
    },
    summary: {
      type: String,
      default: '',
    },
    hashtags: {
      type: [String],
      default: [],
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral',
    },
    topHeadlines: {
      type: [String], // array of top 5 news titles fed to the AI
      default: [],
    },
    keyThemes: {
      type: [String], // 3-5 key themes extracted
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VipInsight', vipInsightSchema, 'VipInsights');
