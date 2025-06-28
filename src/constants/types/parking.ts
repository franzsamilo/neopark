import { SpotType } from "../enums/parking";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  totalSpots: number;
  availableSpots: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingSpot {
  id: string;
  spotId: string;
  parkingLotId: string;
  coordinates: { lat: number; lng: number };
  isOccupied: boolean;
  isActive: boolean;
  spotType: SpotType;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NewParkingLotData {
  name: string;
  address: string;
  description: string;
}
