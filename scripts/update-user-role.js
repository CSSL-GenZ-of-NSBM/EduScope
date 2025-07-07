// Script to update user roles for testing RBAC
import dbConnect from '../src/lib/db/mongodb.js'
import User from '../src/lib/db/models/User.js'

async function updateUserRole() {
  try {
    await dbConnect()
    
    // Find a user by email and update their role
    const email = "adabeysekaraa@students.nsbm.ac.lk" // Replace with actual email
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    )
    
    if (user) {
      console.log(`Updated user ${user.email} to role: ${user.role}`)
    } else {
      console.log(`User with email ${email} not found`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error updating user role:', error)
    process.exit(1)
  }
}

updateUserRole()
