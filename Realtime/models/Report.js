import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Report description is required']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  relatedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['un-read', 'reviewed'],
    default: 'un-read'
  }
}, {
  timestamps: true
});

reportSchema.index({ submittedBy: 1 });
reportSchema.index({ managerId: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
