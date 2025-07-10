module.exports = async () => {
  // Close the in-memory MongoDB instance
  if (global.__MONGO_SERVER__ && typeof global.__MONGO_SERVER__.stop === 'function') {
    await global.__MONGO_SERVER__.stop()
    console.log('MongoDB Memory Server stopped')
  }
}
