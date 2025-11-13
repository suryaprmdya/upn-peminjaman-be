import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Nama harus diisi"]
  },
  npm: {
    type: Number,
    required: [true, "npm harus diisi"]
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"]
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Define allowed roles
    default: 'user', // Set a default role
    // required: true,
  },
  password: {
    type: String,
    required: [true, "Password harus diisi"]
  },
});

const User = mongoose.model("User", userSchema)

export default User