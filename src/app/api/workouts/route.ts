import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end date required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  // Parse as UTC to avoid timezone shifts (date-only strings are UTC midnight)
  const startDate = new Date(start + "T00:00:00.000Z");
  const endDate = new Date(end + "T23:59:59.999Z");

  const workouts = await prisma.scheduledWorkout.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: [{ date: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      type,
      name,
      plannedDurationMinutes,
      plannedDistanceMeters,
      notes,
      order = 0,
    } = body;

    if (!date || !type) {
      return NextResponse.json(
        { error: "date and type required" },
        { status: 400 }
      );
    }

    if (!["cycling", "swimming", "running"].includes(type)) {
      return NextResponse.json(
        { error: "type must be cycling, swimming, or running" },
        { status: 400 }
      );
    }

    // Parse YYYY-MM-DD as noon UTC so it stays the same calendar day in all timezones
    const [y, m, day] = date.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, day, 12, 0, 0, 0));

    const workout = await prisma.scheduledWorkout.create({
      data: {
        date: d,
        type,
        name: name || null,
        plannedDurationMinutes: plannedDurationMinutes ?? null,
        plannedDistanceMeters: plannedDistanceMeters ?? null,
        notes: notes || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json(workout);
  } catch (err) {
    console.error("Create workout error:", err);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
