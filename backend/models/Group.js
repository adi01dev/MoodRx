const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

module.exports = mongoose.model("Group", groupSchema);
