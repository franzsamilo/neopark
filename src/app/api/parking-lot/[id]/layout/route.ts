import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id },
    });

    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    let layoutElements = [];
    if (parkingLot.layoutData) {
      try {
        layoutElements = Array.isArray(parkingLot.layoutData)
          ? parkingLot.layoutData
          : JSON.parse(parkingLot.layoutData as string);
      } catch (error) {
        console.error("Error parsing layout data:", error);
        layoutElements = [];
      }
    }

    return NextResponse.json(layoutElements);
  } catch (error) {
    console.error("Error fetching layout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { layoutElements } = await request.json();

    const parkingLot = await prisma.parkingLot.findUnique({
      where: { id },
    });

    if (!parkingLot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    const parkingSpaces = layoutElements.filter(
      (element: Record<string, unknown>) =>
        element.elementType === "PARKING_SPACE"
    );
    const availableSpaces = parkingSpaces.filter(
      (element: Record<string, unknown>) =>
        !(element.properties as Record<string, unknown>)?.isOccupied
    ).length;

    await prisma.parkingLot.update({
      where: { id },
      data: {
        layoutData: layoutElements,
        totalSpots: parkingSpaces.length,
        availableSpots: availableSpaces,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating layout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
