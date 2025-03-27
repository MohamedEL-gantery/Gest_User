import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    const mongoUrl = process.env.URL;
    console.log(mongoUrl);
    if (!mongoUrl) {
      throw new Error(
        "MongoDB connection URL is not defined in environment variables."
      );
    }
    await mongoose.connect(mongoUrl);

    console.log(`[MongoDB] The connection with database is done successfully!`);
  } catch (error) {
    console.error(
      `[MongoDB] An error occurred while connecting to the database:`,
      error
    );
  }
}
