const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const { Types } = require('mongoose');

const profileSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },apiKey: {
    type: String,
    trim: true,
    default: null,
  },
  portfolio: [{
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    ticker:   String,
    name:     String,
    sector:   String,
    shares:   Number,
    valueUSD: Number,
  }],
  targetSectorPercentages: {
    type: [Number],
    default: () => Array(11).fill(0),
  },
  targetTotalUSD: {
    type: Number,
    default: 0,
  },
});

// set up pre-save middleware to create password
profileSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password with the hashed password
profileSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Profile = model('Profile', profileSchema);

module.exports = Profile;