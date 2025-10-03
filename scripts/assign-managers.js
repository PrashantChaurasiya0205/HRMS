const mongoose = require('mongoose');

// Define the UserProfile schema (same as in the model)
const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  position: { type: String },
  employeeId: { type: String },
  hireDate: { type: String },
  address: { type: String },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  profilePicture: { type: String }
}, {
  timestamps: true,
});

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

async function assignManagers() {
  try {
    // Use the same connection logic as the app
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance';
    
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Manager email addresses
    const managerEmails = [
      'prashantworkoffice@gmail.com',
      'prashantchourasiya51@gmail.com'
    ];

    console.log('Assigning manager roles...');

    for (const email of managerEmails) {
      try {
        // Find user by email and update role to manager
        const user = await UserProfile.findOneAndUpdate(
          { email },
          { 
            role: 'manager',
            // Set default values if user doesn't exist
            $setOnInsert: {
              userId: email,
              firstName: 'Manager',
              lastName: 'User',
              email: email
            }
          },
          { 
            new: true, 
            upsert: true,
            runValidators: true
          }
        );

        console.log(`✅ Updated ${email} to manager role`);
      } catch (error) {
        console.error(`❌ Error updating ${email}:`, error.message);
      }
    }

    // Verify the assignments
    console.log('\nVerifying manager assignments...');
    const managers = await UserProfile.find({ role: 'manager' }, 'email role firstName lastName');
    console.log('Current managers:');
    managers.forEach(manager => {
      console.log(`- ${manager.email} (${manager.firstName} ${manager.lastName})`);
    });

    console.log('\n✅ Manager assignment completed successfully!');
    
  } catch (error) {
    console.error('❌ Error assigning managers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
assignManagers();
