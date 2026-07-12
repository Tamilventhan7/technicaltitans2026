import mongoose, { Schema } from 'mongoose';

export interface IAuditLog {
  action: string; // e.g. Vehicle Created, Driver Assigned, Trip Started, Expense Approved
  details: string;
  user: string; // operator identifier
  timestamp: Date;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true, index: true },
  details: { type: String, required: true },
  user: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

AuditLogSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
AuditLogSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
