import mongoose from "mongoose";

const P2pSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "P2PMessage",
    default: null,
  },
});

const P2PMessage = mongoose.models.P2PMessage || mongoose.model("P2PMessage", P2pSchema);
export default P2PMessage;
