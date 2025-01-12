import mongoose from "mongoose";

const ActiveVoiceUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ActiveVoiceUser = mongoose.models.ActiveVoiceUser || mongoose.model("ActiveVoiceUser", ActiveVoiceUserSchema);

export default ActiveVoiceUser;
