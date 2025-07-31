import { db } from "@/lib/db";
import { createMikroTikService } from "@/lib/mikrotik/service";
import { MikroTikService } from "@/lib/mikrotik/service";

export interface SuspensionResult {
  suspended: number;
  reactivated: number;
  notified: number;
  errors: string[];
}

export class BillingAutomationService {
  private mikrotikService: MikroTikService;

  constructor(mikrotikService: MikroTikService) {
    this.mikrotikService = mikrotikService;
  }

  /**
   * Check for overdue invoices and suspend customers accordingly
   */
  async processOverdueInvoices(): Promise<SuspensionResult> {
    const result: SuspensionResult = {
      suspended: 0,
      reactivated: 0,
      notified: 0,
      errors: []
    };

    try {
      // Get all overdue invoices (invoices that are past due date and not paid)
      const overdueInvoices = await db.invoice.findMany({
        where: {
          status: "PENDING",
          dueDate: {
            lt: new Date()
          }
        },
        include: {
          customer: {
            include: {
              router: true
            }
          }
        }
      });

      // Update overdue invoices to OVERDUE status
      await db.invoice.updateMany({
        where: {
          id: {
            in: overdueInvoices.map(inv => inv.id)
          }
        },
        data: {
          status: "OVERDUE"
        }
      });

      // Group overdue invoices by customer
      const customerOverdueMap = new Map<string, typeof overdueInvoices[0]>();
      overdueInvoices.forEach(invoice => {
        const customerId = invoice.customerId;
        if (!customerOverdueMap.has(customerId)) {
          customerOverdueMap.set(customerId, invoice);
        }
      });

      // Process each customer with overdue invoices
      for (const [customerId, invoice] of customerOverdueMap) {
        try {
          const customer = invoice.customer;
          
          // Skip if already suspended
          if (customer.status === "SUSPENDED") {
            continue;
          }

          // Calculate days overdue
          const daysOverdue = Math.floor(
            (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          // Suspend if overdue by more than 7 days
          if (daysOverdue >= 7) {
            await this.suspendCustomer(customer.id);
            result.suspended++;
            
            // Send suspension notification
            await this.sendSuspensionNotification(customer, daysOverdue);
            result.notified++;
          } else {
            // Send warning notification
            await this.sendOverdueWarning(customer, daysOverdue);
            result.notified++;
          }
        } catch (error) {
          console.error(`Error processing customer ${customerId}:`, error);
          result.errors.push(`Failed to process customer ${customerId}: ${error}`);
        }
      }

      // Process reactivations for customers who have paid
      await this.processReactivations(result);

    } catch (error) {
      console.error("Error processing overdue invoices:", error);
      result.errors.push(`Failed to process overdue invoices: ${error}`);
    }

    return result;
  }

  /**
   * Suspend a customer and disable their PPPoE access
   */
  private async suspendCustomer(customerId: string): Promise<void> {
    try {
      // Update customer status in database
      await db.customer.update({
        where: { id: customerId },
        data: { status: "SUSPENDED" }
      });

      // Get customer with router info
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: { router: true }
      });

      if (customer && customer.router) {
        // Disable PPPoE user in MikroTik
        await this.mikrotikService.disablePPPoEUser(customer);
      }

      console.log(`Customer ${customerId} suspended successfully`);
    } catch (error) {
      console.error(`Error suspending customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Reactivate customers who have paid their overdue invoices
   */
  private async processReactivations(result: SuspensionResult): Promise<void> {
    try {
      // Get suspended customers who have paid all their invoices
      const suspendedCustomers = await db.customer.findMany({
        where: {
          status: "SUSPENDED"
        },
        include: {
          invoices: {
            where: {
              status: {
                in: ["PENDING", "OVERDUE"]
              }
            }
          },
          router: true
        }
      });

      for (const customer of suspendedCustomers) {
        // Check if all invoices are paid
        const hasUnpaidInvoices = customer.invoices.length > 0;
        
        if (!hasUnpaidInvoices) {
          try {
            // Reactivate customer
            await this.reactivateCustomer(customer.id);
            result.reactivated++;
            
            // Send reactivation notification
            await this.sendReactivationNotification(customer);
            result.notified++;
          } catch (error) {
            console.error(`Error reactivating customer ${customer.id}:`, error);
            result.errors.push(`Failed to reactivate customer ${customer.id}: ${error}`);
          }
        }
      }
    } catch (error) {
      console.error("Error processing reactivations:", error);
      result.errors.push(`Failed to process reactivations: ${error}`);
    }
  }

  /**
   * Reactivate a customer and enable their PPPoE access
   */
  private async reactivateCustomer(customerId: string): Promise<void> {
    try {
      // Update customer status in database
      await db.customer.update({
        where: { id: customerId },
        data: { status: "ACTIVE" }
      });

      // Get customer with router info
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: { router: true }
      });

      if (customer && customer.router) {
        // Enable PPPoE user in MikroTik
        await this.mikrotikService.enablePPPoEUser(customer);
      }

      console.log(`Customer ${customerId} reactivated successfully`);
    } catch (error) {
      console.error(`Error reactivating customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Send suspension notification to customer
   */
  private async sendSuspensionNotification(customer: any, daysOverdue: number): Promise<void> {
    try {
      // In a real implementation, this would send an email/SMS
      console.log(`Sending suspension notification to ${customer.email}: Account suspended due to ${daysOverdue} days overdue`);
      
      // Log the notification
      await db.notification.create({
        data: {
          type: "SUSPENSION",
          customerId: customer.id,
          message: `Your account has been suspended due to payment being ${daysOverdue} days overdue. Please pay your outstanding balance to reactivate your service.`,
          status: "SENT"
        }
      });
    } catch (error) {
      console.error(`Error sending suspension notification to customer ${customer.id}:`, error);
    }
  }

  /**
   * Send overdue warning notification to customer
   */
  private async sendOverdueWarning(customer: any, daysOverdue: number): Promise<void> {
    try {
      // In a real implementation, this would send an email/SMS
      console.log(`Sending overdue warning to ${customer.email}: Payment is ${daysOverdue} days overdue`);
      
      // Log the notification
      await db.notification.create({
        data: {
          type: "OVERDUE_WARNING",
          customerId: customer.id,
          message: `Your payment is ${daysOverdue} days overdue. Please pay your invoice to avoid service suspension.`,
          status: "SENT"
        }
      });
    } catch (error) {
      console.error(`Error sending overdue warning to customer ${customer.id}:`, error);
    }
  }

  /**
   * Send reactivation notification to customer
   */
  private async sendReactivationNotification(customer: any): Promise<void> {
    try {
      // In a real implementation, this would send an email/SMS
      console.log(`Sending reactivation notification to ${customer.email}: Account has been reactivated`);
      
      // Log the notification
      await db.notification.create({
        data: {
          type: "REACTIVATION",
          customerId: customer.id,
          message: "Your account has been reactivated. Thank you for your payment!",
          status: "SENT"
        }
      });
    } catch (error) {
      console.error(`Error sending reactivation notification to customer ${customer.id}:`, error);
    }
  }

  /**
   * Generate monthly invoices for all active customers
   */
  async generateMonthlyInvoices(): Promise<{ generated: number; errors: string[] }> {
    const result = { generated: 0, errors: [] as string[] };

    try {
      // Get all active customers
      const activeCustomers = await db.customer.findMany({
        where: {
          status: "ACTIVE"
        },
        include: {
          plan: true,
          invoices: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }
        }
      });

      for (const customer of activeCustomers) {
        try {
          // Check if invoice already exists for this month
          const hasInvoiceThisMonth = customer.invoices.length > 0;
          
          if (!hasInvoiceThisMonth) {
            // Generate invoice for next month
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

            await db.invoice.create({
              data: {
                invoiceNo: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${customer.username}`,
                customerId: customer.id,
                amount: customer.plan.price,
                status: "PENDING",
                dueDate,
                description: `Monthly internet service - ${customer.plan.name} plan`
              }
            });

            result.generated++;
          }
        } catch (error) {
          console.error(`Error generating invoice for customer ${customer.id}:`, error);
          result.errors.push(`Failed to generate invoice for customer ${customer.id}: ${error}`);
        }
      }
    } catch (error) {
      console.error("Error generating monthly invoices:", error);
      result.errors.push(`Failed to generate monthly invoices: ${error}`);
    }

    return result;
  }
}

// Factory function to create billing automation service
export function createBillingAutomationService(routerId?: string): BillingAutomationService {
  // For now, use the first router or create a mock service
  // In a real implementation, you would pass the specific router
  const mockRouter = {
    id: routerId || "1",
    name: "Main Router",
    host: "192.168.1.1",
    port: 8728,
    username: "admin",
    password: "password",
    isActive: true,
    lastSyncAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mikrotikService = createMikroTikService(mockRouter);
  return new BillingAutomationService(mikrotikService);
}

// Create a notification model (this would be in prisma schema)
// For now, we'll define it here for reference
export interface Notification {
  id: string;
  type: "SUSPENSION" | "OVERDUE_WARNING" | "REACTIVATION" | "PAYMENT_RECEIVED";
  customerId: string;
  message: string;
  status: "PENDING" | "SENT" | "FAILED";
  createdAt: Date;
  sentAt?: Date;
}