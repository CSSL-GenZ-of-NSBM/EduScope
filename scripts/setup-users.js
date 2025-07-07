// EduScope User Setup Script
// This script creates three default users with different roles for testing

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduscope';

const users = [
  {
    name: 'Student User',
    email: 'student@students.nsbm.ac.lk',
    password: 'Test@123',
    role: 'student',
    studentId: 'STU001',
    faculty: 'Faculty of Computing'
  },
  {
    name: 'Moderator User',
    email: 'moderator@nsbm.ac.lk',
    password: 'Test@123',
    role: 'moderator',
    studentId: 'MOD001',
    faculty: 'Faculty of Computing'
  },
  {
    name: 'Admin User',
    email: 'admin@nsbm.ac.lk',
    password: 'Test@123',
    role: 'admin',
    studentId: 'ADM001',
    faculty: 'Faculty of Computing'
  }
];

async function setupUsers() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('👥 Setting up users...');
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user document
      const userDoc = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert user
      await usersCollection.insertOne(userDoc);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }
    
    console.log('\n🎉 User setup completed successfully!');
    console.log('\nDefault users created:');
    console.log('📧 student@students.nsbm.ac.lk (Password: Test@123) - Role: student');
    console.log('📧 moderator@nsbm.ac.lk (Password: Test@123) - Role: moderator');
    console.log('📧 admin@nsbm.ac.lk (Password: Test@123) - Role: admin');
    console.log('\nNote: Students use @students.nsbm.ac.lk, Staff use @nsbm.ac.lk');
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the setup
setupUsers();
