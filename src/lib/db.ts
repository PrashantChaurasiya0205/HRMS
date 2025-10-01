import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

const connectToDB = async () => {
  try {
    if (
      mongoose.connection.readyState === mongoose.ConnectionStates.connected
    ) {
      console.log("Using existing database connection");
      return mongoose.connection;
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to the database successfully");

    return mongoose.connection;
  } catch (error) {
    console.error("Database connection error:", error);

    if (process.env.MONGODB_URI !== "production") {
      process.exit(1); // exit only if not in production
    }
  }
};

export default connectToDB;
