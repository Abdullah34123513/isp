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

    const customer = await db.customer.findUnique({
      where: { id: params.id },
      include: { router: true }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { action } = await request.json();

    const mikrotikService = createMikroTikService(customer.router);

    switch (action) {
      case "create":
        const secretId = await mikrotikService.createPPPoEUser(customer);
        return NextResponse.json({ 
          success: true, 
          message: "PPPoE user created successfully",
          secretId 
        });

      case "update":
        await mikrotikService.updatePPPoEUser(customer);
        return NextResponse.json({ 
          success: true, 
          message: "PPPoE user updated successfully"
        });

      case "disable":
        await mikrotikService.disablePPPoEUser(customer);
        return NextResponse.json({ 
          success: true, 
          message: "PPPoE user disabled successfully"
        });

      case "enable":
        await mikrotikService.enablePPPoEUser(customer);
        return NextResponse.json({ 
          success: true, 
          message: "PPPoE user enabled successfully"
        });

      case "delete":
        await mikrotikService.deletePPPoEUser(customer);
        return NextResponse.json({ 
          success: true, 
          message: "PPPoE user deleted successfully"
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing PPPoE user:", error);
    return NextResponse.json(
      { error: "Failed to manage PPPoE user" },
      { status: 500 }
    );
  }
}