import { db } from "@/lib/db";

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "MOBILE_MONEY" | "OTHER";
  transactionId?: string;
  customerNotes?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  message: string;
  error?: string;
}

export interface PaymentGateway {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>;
  getPaymentStatus(paymentId: string): Promise<string>;
}

/**
 * Mock Credit Card Payment Gateway
 */
class MockCreditCardGateway implements PaymentGateway {
  name = "Mock Credit Card";

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        message: "Payment declined: Insufficient funds",
        error: "DECLINED"
      };
    }

    // Generate mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: `pay_${Date.now()}`,
      transactionId,
      message: "Payment processed successfully"
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: refundId,
      transactionId: refundId,
      message: "Refund processed successfully"
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return "COMPLETED";
  }
}

/**
 * Mock Mobile Money Payment Gateway
 */
class MockMobileMoneyGateway implements PaymentGateway {
  name = "Mock Mobile Money";

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        message: "Payment failed: Timeout",
        error: "TIMEOUT"
      };
    }

    const transactionId = `mm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: `mmpay_${Date.now()}`,
      transactionId,
      message: "Mobile money payment processed successfully"
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const refundId = `mmref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: refundId,
      transactionId: refundId,
      message: "Mobile money refund processed successfully"
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return "COMPLETED";
  }
}

/**
 * Mock Bank Transfer Gateway
 */
class MockBankTransferGateway implements PaymentGateway {
  name = "Mock Bank Transfer";

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));

    // Bank transfers rarely fail in this mock
    if (Math.random() < 0.02) {
      return {
        success: false,
        message: "Bank transfer failed: Invalid account",
        error: "INVALID_ACCOUNT"
      };
    }

    const transactionId = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: `btpay_${Date.now()}`,
      transactionId,
      message: "Bank transfer processed successfully"
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const refundId = `btref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: refundId,
      transactionId: refundId,
      message: "Bank transfer refund processed successfully"
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return "COMPLETED";
  }
}

/**
 * Cash Payment Gateway (Manual processing)
 */
class CashPaymentGateway implements PaymentGateway {
  name = "Cash Payment";

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: `cashpay_${Date.now()}`,
      transactionId,
      message: "Cash payment recorded successfully"
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const refundId = `cashref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      paymentId: refundId,
      transactionId: refundId,
      message: "Cash refund processed successfully"
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return "COMPLETED";
  }
}

/**
 * Payment Service - Main service for handling payments
 */
export class PaymentService {
  private gateways: Map<string, PaymentGateway>;

  constructor() {
    this.gateways = new Map();
    this.initializeGateways();
  }

  private initializeGateways() {
    this.gateways.set("CREDIT_CARD", new MockCreditCardGateway());
    this.gateways.set("MOBILE_MONEY", new MockMobileMoneyGateway());
    this.gateways.set("BANK_TRANSFER", new MockBankTransferGateway());
    this.gateways.set("CASH", new CashPaymentGateway());
    this.gateways.set("OTHER", new MockCreditCardGateway()); // Default to credit card
  }

  /**
   * Process a payment for an invoice
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate the request
      const validation = await this.validatePaymentRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          error: validation.error
        };
      }

      // Get the appropriate gateway
      const gateway = this.gateways.get(request.method);
      if (!gateway) {
        return {
          success: false,
          message: "Unsupported payment method",
          error: "UNSUPPORTED_METHOD"
        };
      }

      // Process the payment
      const result = await gateway.processPayment(request);

      if (result.success) {
        // Record the payment in the database
        await this.recordPayment(request, result);
        
        // Update invoice status
        await this.updateInvoiceStatus(request.invoiceId);
      }

      return result;
    } catch (error) {
      console.error("Error processing payment:", error);
      return {
        success: false,
        message: "Payment processing failed",
        error: "PROCESSING_ERROR"
      };
    }
  }

  /**
   * Validate payment request
   */
  private async validatePaymentRequest(request: PaymentRequest): Promise<{ valid: boolean; message: string; error?: string }> {
    // Check if invoice exists
    const invoice = await db.invoice.findUnique({
      where: { id: request.invoiceId },
      include: { customer: true }
    });

    if (!invoice) {
      return {
        valid: false,
        message: "Invoice not found",
        error: "INVOICE_NOT_FOUND"
      };
    }

    // Check if invoice is already paid
    if (invoice.status === "PAID") {
      return {
        valid: false,
        message: "Invoice is already paid",
        error: "INVOICE_ALREADY_PAID"
      };
    }

    // Check if payment amount matches invoice amount
    if (request.amount !== invoice.amount) {
      return {
        valid: false,
        message: "Payment amount does not match invoice amount",
        error: "AMOUNT_MISMATCH"
      };
    }

    return { valid: true, message: "Validation successful" };
  }

  /**
   * Record payment in database
   */
  private async recordPayment(request: PaymentRequest, result: PaymentResult): Promise<void> {
    const invoice = await db.invoice.findUnique({
      where: { id: request.invoiceId },
      include: { customer: true }
    });

    if (!invoice) return;

    await db.payment.create({
      data: {
        invoiceId: request.invoiceId,
        customerId: invoice.customerId,
        amount: request.amount,
        method: request.method,
        transactionId: result.transactionId,
        status: "COMPLETED" as const,
        paidAt: new Date()
      }
    });

    // Update customer balance
    await db.customer.update({
      where: { id: invoice.customerId },
      data: {
        balance: {
          increment: request.amount
        }
      }
    });
  }

  /**
   * Update invoice status after successful payment
   */
  private async updateInvoiceStatus(invoiceId: string): Promise<void> {
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID" as const,
        paidAt: new Date()
      }
    });
  }

  /**
   * Process a refund
   */
  async processRefund(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      // Get the payment record
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: { invoice: true }
      });

      if (!payment) {
        return {
          success: false,
          message: "Payment not found",
          error: "PAYMENT_NOT_FOUND"
        };
      }

      // Get the appropriate gateway
      const gateway = this.gateways.get(payment.method);
      if (!gateway) {
        return {
          success: false,
          message: "Unsupported payment method for refund",
          error: "UNSUPPORTED_METHOD"
        };
      }

      // Process the refund
      const refundAmount = amount || payment.amount;
      const result = await gateway.refundPayment(paymentId, refundAmount);

      if (result.success) {
        // Record the refund
        await db.payment.create({
          data: {
            invoiceId: payment.invoiceId,
            customerId: payment.customerId,
            amount: -refundAmount, // Negative amount for refund
            method: payment.method,
            transactionId: result.transactionId,
            status: "COMPLETED" as const,
            paidAt: new Date()
          }
        });

        // Update customer balance
        await db.customer.update({
          where: { id: payment.customerId },
          data: {
            balance: {
              decrement: refundAmount
            }
          }
        });

        // Update invoice status if full refund
        if (refundAmount >= payment.amount) {
          await db.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              status: "REFUNDED" as const
            }
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error processing refund:", error);
      return {
        success: false,
        message: "Refund processing failed",
        error: "REFUND_ERROR"
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<string> {
    const payment = await db.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment.status;
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: "CREDIT_CARD", label: "Credit Card", description: "Pay with Visa, Mastercard, or other credit cards" },
      { value: "MOBILE_MONEY", label: "Mobile Money", description: "Pay with mobile money services" },
      { value: "BANK_TRANSFER", label: "Bank Transfer", description: "Direct bank transfer" },
      { value: "CASH", label: "Cash", description: "Cash payment at our office" },
      { value: "OTHER", label: "Other", description: "Other payment methods" }
    ];
  }
}

// Factory function to create payment service
export function createPaymentService(): PaymentService {
  return new PaymentService();
}