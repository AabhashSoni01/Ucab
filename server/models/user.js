const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: [true, 'Name is required'], trim: true },
    email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:     { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone:        { type: String, trim: true },
    profileImage: { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);