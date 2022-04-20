// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb

const { MongoClient } = require("mongodb")
const { envUtil } = require("../util/envUtil")

const variables = envUtil.getEnviromentVariable()

const uri = process.env.MONGODB_URI
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env")
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

module.exports = clientPromise