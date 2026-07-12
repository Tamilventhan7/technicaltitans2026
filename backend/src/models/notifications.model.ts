import mongoose, { Schema, Document } from 'mongoose';
import { Notification as NotificationType, ChatMessage as ChatMessageType } from '../types';

export interface NotificationDocument extends Omit<NotificationType, 'createdAt' | 'updatedAt'>, Document {}
export interface ChatMessageDocument extends Omit<ChatMessageType, 'createdAt' | 'updatedAt'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'critical'], 
    default: 'info' 
  },
  readStatus: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const ChatMessageSchema = new Schema<ChatMessageDocument>({
  id: { type: String, required: true, unique: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema);
export const ChatMessage = mongoose.model<ChatMessageDocument>('ChatMessage', ChatMessageSchema);
