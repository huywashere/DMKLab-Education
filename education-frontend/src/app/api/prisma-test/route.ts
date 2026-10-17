import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  try {
    const [userCount, gradeCount, lessonCount, sampleUsers] = await Promise.all([
      prisma.users.count(),
      prisma.grades.count(),
      prisma.lessons.count(),
      prisma.users.findMany({
        take: 3,
        select: {
          id: true,
          username: true,
          full_name: true,
          role: true,
          energy_points: true,
        },
      }),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      orm: "Prisma 6.4.0",
      connectedTo: "PostgreSQL 17 (learning_db)",
      latencyMs,
      metrics: {
        totalUsers: userCount,
        totalGrades: gradeCount,
        totalLessons: lessonCount,
      },
      sampleData: sampleUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
