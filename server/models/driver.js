const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DriverSchema = new mongoose.Schema(
  {
    name:          { type: String, required: [true, 'Driver name is required'], trim: true },
    email:         { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:      { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone:         { type: String, required: [true, 'Phone number is required'], trim: true },
    licenseNumber: { type: String, required: [true, 'License number is required'], unique: true, trim: true },
    profileImage:  { type: String, default: '' },
    car:           { type: mongoose.Schema.Types.ObjectId, ref: 'Car', default: null },
    isAvailable:   { type: Boolean, default: true },
    isActive:      { type: Boolean, default: true },
    isVerified:    { type: Boolean, default: false },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    rating:        { type: Number, default: 5.0, min: 1, max: 5 },
    totalRides:    { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

DriverSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Driver', DriverSchema);