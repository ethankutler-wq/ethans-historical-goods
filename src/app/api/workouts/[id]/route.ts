import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      date,
      type,
      name,
      plannedDurationMinutes,
      plannedDistanceMeters,
      notes,
      order,
    } = body;

    const data: Record<string, unknown> = {};
    if (date != null) {
      const dateStr = typeof date === "string" ? date.slice(0, 10) : date;
      const [y, m, day] = dateStr.split("-").map(Number);
      data.date = new Date(Date.UTC(y, m - 1, day, 12, 0, 0, 0));
    }
    if (type != null) data.type = type;
    if (name != null) data.name = name;
    if (plannedDurationMinutes != null)
      data.plannedDurationMinutes = plannedDurationMinutes;
    if (plannedDistanceMeters != null)
      data.plannedDistanceMeters = plannedDistanceMeters;
    if (notes != null) data.notes = notes;
    if (order != null) data.order = order;

    const workout = await prisma.scheduledWorkout.update({
      where: { id },
      data,
    });

    return NextResponse.json(workout);
  } catch (err) {
    console.error("Update workout error:", err);
    return NextResponse.json(
      { error: "Failed to update workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.scheduledWorkout.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete workout error:", err);
    return NextResponse.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
