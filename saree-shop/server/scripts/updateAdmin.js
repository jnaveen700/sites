import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const adminDetails = {
  name: 'Chandra Shekar',
  email: 'jangamchandra700@gmail.com',
  password: 'Jangam700',
  role: 'admin',
};

const updateAdmin = async () => {
  let exitCode = 0;
  let connected = false;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(process.env.MONGO_URI);
    connected = true;

    const currentAdmin = await User.findOne({
      $or: [{ email: adminDetails.email }, { role: 'admin' }],
    });

    if (!currentAdmin) {
      throw new Error('No existing admin user found to update');
    }

    const hashedPassword = await bcrypt.hash(adminDetails.password, 12);

    await User.updateOne(
      { _id: currentAdmin._id },
      {
        $set: {
          name: adminDetails.name,
          email: adminDetails.email,
          password: hashedPassword,
          role: adminDetails.role,
          isActive: true,
          updatedAt: new Date(),
        },
      }
    );

    await User.updateMany(
      {
        _id: { $ne: currentAdmin._id },
        role: 'admin',
      },
      {
        $set: {
          role: 'customer',
          updatedAt: new Date(),
        },
      }
    );

    console.log('Admin updated successfully');
  } catch (error) {
    console.error('Failed to update admin:', error.message);
    exitCode = 1;
  } finally {
    if (connected) {
      await mongoose.disconnect();
    }

    process.exit(exitCode);
  }
};

updateAdmin();