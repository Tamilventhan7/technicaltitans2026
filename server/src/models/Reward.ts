import mongoose, { Schema } from 'mongoose';

export interface IReward {
  driver: string; // Driver ID e.g. DRV-01
  points: number;
  badge?: string; // Eco-Warrior, Safety Champion, etc.
  reason: string;
  trip?: string; // Assigned trip ID if applicable
  date: Date;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const RewardSchema: Schema = new Schema({
  driver: { type: String, required: true, index: true },
  points: { type: Number, required: true },
  badge: { type: String },
  reason: { type: String, required: true },
  trip: { type: String },
  date: { type: Date, default: Date.now },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

RewardSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
RewardSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Reward || mongoose.model<IReward>('Reward', RewardSchema);
