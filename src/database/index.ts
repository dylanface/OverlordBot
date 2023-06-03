// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb

import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

const client = new MongoClient(uri);
const clientPromise = client.connect();

export = clientPromise;
