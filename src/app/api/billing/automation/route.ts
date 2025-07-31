import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createBillingAutomationService } from "@/lib/billing/automation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ISP_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    const billingService = createBillingAutomationService();

    switch (action) {
      case "process-overdue":
        const result = await billingService.processOverdueInvoices();
        return NextResponse.json(result);

      case "generate-monthly":
        const invoiceResult = await billingService.generateMonthlyInvoices();
        return NextResponse.json(invoiceResult);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in billing automation:", error);
    return NextResponse.json(
      { error: "Failed to process billing automation" },
      { status: 500 }
    );
  }
}