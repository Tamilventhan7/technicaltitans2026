import mongoose, { Schema, Document } from 'mongoose';
import { Reward as RewardType, Leaderboard as LeaderboardType } from '../types';

export interface RewardDocument extends Omit<RewardType, 'createdAt' | 'updatedAt'>, Document {}
export interface LeaderboardDocument extends Omit<LeaderboardType, 'createdAt' | 'updatedAt'>, Document {}

const RewardSchema = new Schema<RewardDocument>({
  id: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true },
  claimedAt: { type: Date, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const LeaderboardSchema = new Schema<LeaderboardDocument>({
  id: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  safetyScore: { type: Number, required: true },
  points: { type: Number, required: true },
  rank: { type: Number, required: true },
  period: { type: String, required: true }, // e.g. "Monthly-2026-07"
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Reward = mongoose.model<RewardDocument>('Reward', RewardSchema);
export const Leaderboard = mongoose.model<LeaderboardDocument>('Leaderboard', LeaderboardSchema);
