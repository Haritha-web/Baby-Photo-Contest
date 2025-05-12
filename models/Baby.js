import mongoose from 'mongoose';

const babySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: "true",
    max: 5,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true
  },
  babyCode: {
    type: String,
    unique: true,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  voters: [
    {
      voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voter',
        required: true
      },
      timestamp: {
        type: Date,
        required: true
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const Baby = mongoose.model('Baby', babySchema);
export default Baby;