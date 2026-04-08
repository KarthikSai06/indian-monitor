const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('\x1b[31m[DB] MONGODB_URI is not set in .env\x1b[0m');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      // Mongoose 7+ no longer needs useNewUrlParser / useUnifiedTopology
    });

    console.log(`\x1b[32m[DB] MongoDB connected: ${conn.connection.host}\x1b[0m`);

    mongoose.connection.on('error', (err) => {
      console.error('\x1b[31m[DB] MongoDB error:', err.message, '\x1b[0m');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('\x1b[33m[DB] MongoDB disconnected\x1b[0m');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('\x1b[33m[DB] MongoDB connection closed (app shutdown)\x1b[0m');
      process.exit(0);
    });

    return conn;
  } catch (err) {
    console.error('\x1b[31m[DB] MongoDB connection failed:', err.message, '\x1b[0m');
    process.exit(1);
  }
};

module.exports = connectDB;
