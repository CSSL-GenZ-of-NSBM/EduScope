const { MongoMemoryServer } = require('mongodb-memory-server')

module.exports = async () => {
  // Start in-memory MongoDB instance for testing
  const mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'eduscope-test',
    },
  })

  // Store the mongo server instance globally so we can close it in teardown
  global.__MONGO_SERVER__ = mongoServer

  // Set the MongoDB URI for tests
  process.env.MONGODB_URI = mongoServer.getUri()
}
