#!/usr/bin/env node

/**
 * Seed script to populate the database with test degree data
 * Run this script to add sample degrees for testing the application
 */

const { MongoClient } = require('mongodb')
const degreeTestData = require('./degreeTestData')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduscope'

async function seedDegrees() {
  let client

  try {
    console.log('🌱 Starting degree data seeding...')
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const degreesCollection = db.collection('degrees')

    // Check if degrees already exist
    const existingDegreesCount = await degreesCollection.countDocuments()
    if (existingDegreesCount > 0) {
      console.log(`⚠️  Found ${existingDegreesCount} existing degrees in database`)
      console.log('💡 To clear existing data first, run: npm run seed:clear')
      
      // Ask user if they want to continue
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to continue and add more degrees? (y/N): ', resolve)
      })
      rl.close()
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled by user')
        return
      }
    }

    // Add timestamps to each degree
    const degreesWithTimestamps = degreeTestData.map(degree => ({
      ...degree,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // Insert the degrees
    const result = await degreesCollection.insertMany(degreesWithTimestamps)
    
    console.log(`✅ Successfully inserted ${result.insertedCount} degrees`)
    console.log('📊 Degree Summary:')
    
    // Group by faculty and show summary
    const facultyCount = {}
    degreeTestData.forEach(degree => {
      facultyCount[degree.faculty] = (facultyCount[degree.faculty] || 0) + 1
    })
    
    Object.entries(facultyCount).forEach(([faculty, count]) => {
      console.log(`   ${faculty}: ${count} degree(s)`)
    })

    console.log('\n🎉 Degree seeding completed successfully!')
    console.log('🔗 You can now test the degree-related features:')
    console.log('   • Admin Degree Management: /admin/degrees')
    console.log('   • Class Calculator: /calculator')
    console.log('   • Degree Guidance: /guidance')
    console.log('   • User Management with Degrees: /admin/users')

  } catch (error) {
    console.error('❌ Error seeding degrees:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }
}

async function clearDegrees() {
  let client

  try {
    console.log('🧹 Clearing existing degree data...')
    
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db()
    const result = await db.collection('degrees').deleteMany({})
    
    console.log(`✅ Cleared ${result.deletedCount} degrees from database`)
    
  } catch (error) {
    console.error('❌ Error clearing degrees:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Handle command line arguments
const command = process.argv[2]

if (command === 'clear') {
  clearDegrees()
} else {
  seedDegrees()
}
