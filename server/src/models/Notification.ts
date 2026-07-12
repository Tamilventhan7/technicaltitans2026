import mongoose, { Schema } from 'mongoose';

export interface INotification {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'maintenance' | 'fuel_theft' | 'route_deviation' | 'speeding' | 'harsh_braking' | 'accident' | 'weather_risk' | 'traffic_delay' | 'info' | 'sos';
  user?: string; // target user id, or undefined for global/broadcast
  read: boolean;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  type: { 
    type: String, 
    enum: ['maintenance', 'fuel_theft', 'route_deviation', 'speeding', 'harsh_braking', 'accident', 'weather_risk', 'traffic_delay', 'info', 'sos'], 
    required: true,
    index: true
  },
  user: { type: String, index: true },
  read: { type: Boolean, default: false, index: true },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

NotificationSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
NotificationSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
