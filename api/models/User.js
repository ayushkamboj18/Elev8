const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"], 
    default: "user",        
  },
}, {
  timestamps: true,         
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
