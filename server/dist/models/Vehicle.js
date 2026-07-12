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
const VehicleSchema = new mongoose_1.Schema({
    vehicleNumber: { type: String, required: true, unique: true, index: true },
    vehicleType: {
        type: String,
        enum: ['Heavy Duty Truck', 'Reefer', 'Medium Cargo', 'Sprinter Van'],
        required: true
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: { type: String, enum: ['Diesel', 'Electric', 'Hybrid', 'Gasoline'], required: true },
    capacity: { type: Number, required: true },
    engineNumber: { type: String, required: true },
    chassisNumber: { type: String, required: true },
    insuranceNumber: { type: String, required: true },
    insuranceExpiry: { type: Date, required: true },
    fitnessExpiry: { type: Date, required: true },
    pollutionExpiry: { type: Date, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true },
    odometer: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['idle', 'in-transit', 'maintenance', 'out-of-service'],
        default: 'idle',
        index: true
    },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    assignedDriver: { type: String },
    assignedTrip: { type: String },
    documents: [{ type: String }],
    images: [{ type: String }],
    createdBy: { type: String },
    updatedBy: { type: String },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
VehicleSchema.pre('find', function () {
    this.where({ isDeleted: { $ne: true } });
});
VehicleSchema.pre('findOne', function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.default = mongoose_1.default.models.Vehicle || mongoose_1.default.model('Vehicle', VehicleSchema);
