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
const DriverSchema = new mongoose_1.Schema({
    driverId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, required: true },
    experience: { type: Number, required: true },
    safetyScore: { type: Number, default: 90, min: 0, max: 100 },
    rewardPoints: { type: Number, default: 0 },
    rank: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'],
        default: 'Bronze',
        index: true
    },
    documents: [{ type: String }],
    status: {
        type: String,
        enum: ['available', 'driving', 'resting', 'sick', 'suspended'],
        default: 'available',
        index: true
    },
    photo: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});
DriverSchema.pre('find', function () {
    this.where({ isDeleted: { $ne: true } });
});
DriverSchema.pre('findOne', function () {
    this.where({ isDeleted: { $ne: true } });
});
exports.default = mongoose_1.default.models.Driver || mongoose_1.default.model('Driver', DriverSchema);
