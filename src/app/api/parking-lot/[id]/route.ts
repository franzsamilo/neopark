import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({
      ...parkingLot,
      layoutElements,
    });
  } catch (error) {
    console.error("Error fetching parking lot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parkingLot = await prisma.parkingLot.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(parkingLot);
  } catch (error) {
    console.error("Error updating parking lot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.parkingLot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting parking lot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
