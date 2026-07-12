import mongoose, { Schema } from 'mongoose';

export interface IExpense {
  expenseType: 'Fuel' | 'Maintenance' | 'Salary' | 'Parking' | 'Toll' | 'Repair' | 'Insurance' | 'Food' | 'Miscellaneous';
  vehicle?: string;
  trip?: string;
  driver?: string;
  amount: number;
  paymentMode: 'Cash' | 'Card' | 'FuelCard' | 'BankTransfer';
  invoice?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema: Schema = new Schema({
  expenseType: { 
    type: String, 
    enum: ['Fuel', 'Maintenance', 'Salary', 'Parking', 'Toll', 'Repair', 'Insurance', 'Food', 'Miscellaneous'], 
    required: true,
    index: true 
  },
  vehicle: { type: String, index: true },
  trip: { type: String, index: true },
  driver: { type: String, index: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMode: { type: String, enum: ['Cash', 'Card', 'FuelCard', 'BankTransfer'], required: true },
  invoice: { type: String },
  approvedBy: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true
  },
  remarks: { type: String },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

ExpenseSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
ExpenseSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
