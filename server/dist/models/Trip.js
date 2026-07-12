"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TripSchema = new mongoose_1.Schema({
    tripId: { type: String, required: true, unique: true, index: true },
    vehicle: { type: String, required: true, index: true },
    driver: { type: String, required: true, index: true },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    distance: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    actualTime: { type: Number },
    route: [{
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }],
    currentRouteIndex: { type: Number, default: 0 },
    tripStatus: {
        type: String,
        enum: ['pending', 'dispatched', 'in-transit', 'delivered', 'delayed', 'cancelled'],
        default: 'pending',
        index: true
    },
    cargoType: {
        type: String,
        enum: ['hazmat', 'cold-chain', 'high-value', 'standard'],
        required: true
    },
    customer: { type: String, required: true },
    tripStart: { type: Date },
    tripEnd: { type: Date },
    fuelUsed: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    proofOfDelivery: {
        signature: { type: String },
        photoUrl: { type: String },
        deliveredAt: { type: Date },
        receivedBy: { type: String }
    },
    rating: { type: Number, min: 1, max: 5 },
    createdBy: { type: String },
    updatedBy: { type: String },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
TripSchema.pre('find', function () {
    this.where({ isDeleted: { $ne: true } });
});
TripSchema.pre('findOne', function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.default = mongoose_1.default.models.Trip || mongoose_1.default.model('Trip', TripSchema);
