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
  phone: '0000000000',
};

const createAdmin = async () => {
  let exitCode = 0;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({
      $or: [{ email: adminDetails.email }, { role: 'admin' }],
    });

    if (existingUser) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminDetails.password, 12);

    const adminUser = new User({
      name: adminDetails.name,
      email: adminDetails.email,
      phone: adminDetails.phone,
      password: hashedPassword,
      role: adminDetails.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await adminUser.validate();
    await User.collection.insertOne(adminUser.toObject({ depopulate: true }));

    console.log('Admin created successfully');
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.exit(exitCode);
  }
};

createAdmin();