// ⚠️ FUTURE FEATURE - PHASE 3
// Staff Management Model
// Purpose: Manage employees, roles, departments, and permissions
// Status: DISABLED in production (rename .FUTURE to activate)
// How to enable: Rename to StaffManagement.js and uncomment in server.js
// TODO for future agents:
//   - Update imports in controllers/staffManagementController.FUTURE.js
//   - Add routes to server.js: app.use('/api/staff', staffManagementRoutes)
//   - Implement role-based access control (RBAC) beyond admin/user
//   - Add department management and reporting structure
//   - Integrate with authentication for staff login

import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    department: {
      type: String,
      enum: ['sales', 'support', 'management'],
      default: 'sales',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Employee', employeeSchema);
