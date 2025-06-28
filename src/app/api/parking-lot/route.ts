import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      address,
      description,
      coordinates,
      totalSpots,
      availableSpots,
      layoutData,
      creatorId,
    } = body;

    if (
      !name ||
      !address ||
      !coordinates ||
      typeof coordinates.lat !== "number" ||
      typeof coordinates.lng !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const parkingLot = await prisma.parkingLot.create({
      data: {
        name,
        address,
        description,
        coordinates,
        totalSpots: totalSpots ?? 0,
        availableSpots: availableSpots ?? 0,
        layoutData,
        creatorId,
      },
    });

    return NextResponse.json(parkingLot, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create parking lot" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const lots = await prisma.parkingLot.findMany();
    return NextResponse.json(lots);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch parking lots" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await prisma.parkingLot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete parking lot" },
      { status: 500 }
    );
  }
}
