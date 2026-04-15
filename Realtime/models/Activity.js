import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  details: { type: String },
  entityId: { type: String }
}, {
  timestamps: true
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema); // Changed collection name to singular

export default Activity;

