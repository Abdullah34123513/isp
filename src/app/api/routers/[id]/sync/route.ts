import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { createMikroTikService } from "@/lib/mikrotik/service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ISP_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const router = await db.router.findUnique({
      where: { id: params.id }
    });

    if (!router) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 });
    }

    const mikrotikService = createMikroTikService(router);
    const result = await mikrotikService.syncCustomersFromRouter();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing router:", error);
    return NextResponse.json(
      { error: "Failed to sync router" },
      { status: 500 }
    );
  }
}