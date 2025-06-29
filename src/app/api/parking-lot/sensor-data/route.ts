import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateUltrasonicData,
  processUltrasonicData,
} from "@/lib/sensor-utils";
import { UltrasonicDataMessage } from "@/constants/types/parking";
import type { ParkingSpot, ParkingLot } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!validateUltrasonicData(body)) {
      return NextResponse.json(
        { error: "Invalid ultrasonic data format" },
        { status: 400 }
      );
    }

    const sensorData: UltrasonicDataMessage = body;
    const processedData = processUltrasonicData(sensorData);

    // Find the parking spot by deviceId (fetch all, filter in JS if needed)
    let parkingSpot = await prisma.parkingSpot.findFirst({
      where: {
        isActive: true,
        // @ts-expect-error: deviceId should exist if schema/client are in sync
        deviceId: sensorData.deviceId,
      },
      include: {
        parkingLot: true,
      },
    });
    // Fallback: if deviceId is not in type, fetch all and filter
    if (!parkingSpot && sensorData.deviceId) {
      const spots = await prisma.parkingSpot.findMany({
        where: { isActive: true },
        // include all fields, plus parkingLot
        include: { parkingLot: true },
      });
      parkingSpot =
        spots.find(
          (s) =>
            (s as ParkingSpot & { deviceId?: string }).deviceId ===
            sensorData.deviceId
        ) || null;
    }
    if (!parkingSpot) {
      return NextResponse.json(
        { error: "Parking spot not found for device ID" },
        { status: 404 }
      );
    }

    // Create new sensor reading
    const sensorReading = await prisma.sensorReading.create({
      data: {
        parkingSpotId: parkingSpot.id,
        distance: processedData.distance,
        deviceId: processedData.deviceId,
        timestamp: processedData.timestamp,
        isOccupied: processedData.isOccupied,
      },
    });

    // Update parking spot occupancy status
    await prisma.parkingSpot.update({
      where: { id: parkingSpot.id },
      data: {
        isOccupied: processedData.isOccupied,
        lastUpdated: new Date(),
      },
    });

    // Update parking lot available spots count
    const occupiedSpots = await prisma.parkingSpot.count({
      where: {
        parkingLotId: parkingSpot.parkingLotId,
        isOccupied: true,
        isActive: true,
      },
    });
    // If parkingLot is not included, fetch it
    let parkingLot = (parkingSpot as ParkingSpot & { parkingLot?: ParkingLot })
      .parkingLot;
    if (!parkingLot) {
      const foundLot = await prisma.parkingLot.findUnique({
        where: { id: parkingSpot.parkingLotId },
      });
      parkingLot = foundLot ?? undefined;
    }
    await prisma.parkingLot.update({
      where: { id: parkingSpot.parkingLotId },
      data: {
        availableSpots: (parkingLot?.totalSpots || 0) - occupiedSpots,
      },
    });

    return NextResponse.json({
      success: true,
      parkingSpot: {
        id: parkingSpot.id,
        spotId: parkingSpot.spotId,
        isOccupied: processedData.isOccupied,
        lastUpdated: new Date(),
      },
      sensorReading: {
        id: sensorReading.id,
        distance: sensorReading.distance,
        isOccupied: sensorReading.isOccupied,
        timestamp: sensorReading.timestamp,
      },
    });
  } catch (error) {
    console.error("Error processing sensor data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parkingLotId = searchParams.get("parkingLotId");
    const deviceId = searchParams.get("deviceId");

    if (!parkingLotId && !deviceId) {
      return NextResponse.json(
        { error: "parkingLotId or deviceId parameter is required" },
        { status: 400 }
      );
    }

    // Use Record<string, unknown> instead of any
    const where: Record<string, unknown> = { isActive: true };

    if (parkingLotId) {
      where.parkingLotId = parkingLotId;
    }

    if (deviceId) {
      where.deviceId = deviceId;
    }

    // Remove sensorReadings from include if not supported
    const parkingSpots = await prisma.parkingSpot.findMany({
      where,
      include: {
        parkingLot: {
          select: {
            id: true,
            name: true,
            totalSpots: true,
            availableSpots: true,
          },
        },
      },
      orderBy: {
        spotId: "asc",
      },
    });

    // For each spot, fetch the latest sensor reading
    const spotsWithReadings = await Promise.all(
      parkingSpots.map(async (spot) => {
        const readings = await prisma.sensorReading.findMany({
          where: { parkingSpotId: spot.id },
          orderBy: { timestamp: "desc" },
          take: 1,
        });
        return { ...spot, sensorReadings: readings };
      })
    );

    return NextResponse.json(spotsWithReadings);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
