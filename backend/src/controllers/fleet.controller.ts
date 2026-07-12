import { Response } from 'express';
import { Vehicle, Driver, Warehouse, DocumentModel } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../services/upload.service';

// Vehicles
export async function getVehicles(req: AuthenticatedRequest, res: Response) {
  try {
    const query: any = { isDeleted: false };
    if (req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    const list = await Vehicle.find(query);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createVehicle(req: AuthenticatedRequest, res: Response) {
  const orgId = req.user?.organizationId || 'ORG-DEFAULT';
  const { id, plateNumber, type, fuelCapacity, currentFuel, fuelEfficiency, odometer, healthScore, latitude, longitude } = req.body;

  try {
    const existing = await Vehicle.findOne({ plateNumber, isDeleted: false });
    if (existing) {
      return res.status(400).json({ error: `Vehicle with plate number ${plateNumber} already exists` });
    }

    const vehicle = await Vehicle.create({
      id: id || `TRK-${Math.floor(10 + Math.random() * 90)}`,
      plateNumber,
      type,
      fuelCapacity,
      currentFuel: currentFuel ?? fuelCapacity,
      fuelEfficiency,
      odometer: odometer ?? 0,
      healthScore: healthScore ?? 100,
      telemetry: { engineTemp: 80, oilPressure: 50, batteryVoltage: 14 },
      gps: {
        latitude: latitude ?? 41.8781,
        longitude: longitude ?? -87.6298,
        speed: 0,
        heading: 0
      },
      organizationId: orgId,
      createdBy: req.user?.id,
      isDeleted: false
    });

    res.status(201).json(vehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateVehicle(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findOne({ id, isDeleted: false });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    Object.assign(vehicle, req.body);
    vehicle.updatedBy = req.user?.id;
    await vehicle.save();

    res.json(vehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteVehicle(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const vehicle = await Vehicle.findOne({ id, isDeleted: false });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicle.isDeleted = true;
    vehicle.updatedBy = req.user?.id;
    await vehicle.save();

    res.json({ success: true, message: 'Vehicle soft-deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Drivers
export async function getDrivers(req: AuthenticatedRequest, res: Response) {
  try {
    const query: any = { isDeleted: false };
    if (req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    const list = await Driver.find(query);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createDriver(req: AuthenticatedRequest, res: Response) {
  const orgId = req.user?.organizationId || 'ORG-DEFAULT';
  const { id, userId, name, licenseNumber, licenseExpiry } = req.body;

  try {
    const driver = await Driver.create({
      id: id || `DRV-${Math.floor(10 + Math.random() * 90)}`,
      userId: userId || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      status: 'available',
      rating: 5.0,
      safetyScore: 100,
      activeHoursToday: 0,
      totalMiles: 0,
      gamification: { tier: 'Bronze', points: 0, badges: [], safeDrivingStreak: 0 },
      organizationId: orgId,
      createdBy: req.user?.id,
      isDeleted: false
    });

    res.status(201).json(driver);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateDriver(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const driver = await Driver.findOne({ id, isDeleted: false });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    Object.assign(driver, req.body);
    driver.updatedBy = req.user?.id;
    await driver.save();

    res.json(driver);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteDriver(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  try {
    const driver = await Driver.findOne({ id, isDeleted: false });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.isDeleted = true;
    driver.updatedBy = req.user?.id;
    await driver.save();

    res.json({ success: true, message: 'Driver soft-deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Warehouses
export async function getWarehouses(req: AuthenticatedRequest, res: Response) {
  try {
    const list = await Warehouse.find({ isDeleted: false });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// Upload documents
export async function uploadDocument(req: AuthenticatedRequest, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided for upload' });
  }

  const { title, type, expiryDate } = req.body;

  try {
    const secureUrl = await uploadToCloudinary(req.file, 'driver_documents');
    const docId = `DOC-${Date.now()}`;

    const newDoc = await DocumentModel.create({
      id: docId,
      title: title || req.file.originalname,
      type: type || 'License Proof',
      fileUrl: secureUrl,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'pending_review',
      createdBy: req.user?.id,
      isDeleted: false
    });

    res.status(201).json(newDoc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
