import { db } from "@/lib/db";
import { MikroTikAPI, createMikroTikClient, cachedMikroTikCall, PPPoESecret, PPPoEActive } from "./api";
import { Router, Customer, Plan } from "@/lib/db";

export interface SyncResult {
  added: number;
  updated: number;
  disabled: number;
  errors: string[];
}

export class MikroTikService {
  private api: MikroTikAPI;
  private router: Router;

  constructor(router: Router) {
    this.router = router;
    this.api = createMikroTikClient(router);
  }

  async syncCustomersFromRouter(): Promise<SyncResult> {
    const result: SyncResult = {
      added: 0,
      updated: 0,
      disabled: 0,
      errors: []
    };

    try {
      // Get all PPPoE secrets from the router
      const secrets = await cachedMikroTikCall(this.router, 'ppp-secrets', () => 
        this.api.getPPPoESecrets()
      );

      // Get existing customers from database
      const existingCustomers = await db.customer.findMany({
        where: { routerId: this.router.id }
      });

      const existingCustomersMap = new Map(
        existingCustomers.map(c => [c.username, c])
      );

      for (const secret of secrets) {
        try {
          const existingCustomer = existingCustomersMap.get(secret.name);

          if (!existingCustomer) {
            // Create new customer
            const plan = await this.findPlanByProfile(secret.profile);
            if (!plan) {
              result.errors.push(`No plan found for profile: ${secret.profile}`);
              continue;
            }

            await db.customer.create({
              data: {
                username: secret.name,
                password: secret.password, // In production, encrypt this
                name: secret.comment || secret.name,
                email: `${secret.name}@isp.local`,
                status: secret.disabled ? 'SUSPENDED' : 'ACTIVE',
                routerId: this.router.id,
                planId: plan.id,
                pppoeSecret: secret.id,
              }
            });
            result.added++;
          } else {
            // Update existing customer
            const updates: any = {
              password: secret.password, // In production, encrypt this
              status: secret.disabled ? 'SUSPENDED' : 'ACTIVE',
              pppoeSecret: secret.id,
            };

            // Update plan if profile changed
            if (secret.profile !== existingCustomer.plan?.pppProfile) {
              const plan = await this.findPlanByProfile(secret.profile);
              if (plan) {
                updates.planId = plan.id;
              }
            }

            await db.customer.update({
              where: { id: existingCustomer.id },
              data: updates
            });
            result.updated++;
          }
        } catch (error) {
          console.error(`Error syncing customer ${secret.name}:`, error);
          result.errors.push(`Failed to sync customer ${secret.name}: ${error}`);
        }
      }

      // Update router last sync time
      await db.router.update({
        where: { id: this.router.id },
        data: { lastSyncAt: new Date() }
      });

    } catch (error) {
      console.error('Error syncing customers from router:', error);
      result.errors.push(`Failed to sync from router: ${error}`);
    }

    return result;
  }

  async createPPPoEUser(customer: Customer): Promise<string> {
    try {
      const plan = await db.plan.findUnique({
        where: { id: customer.planId }
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      const secretId = await this.api.addPPPoESecret({
        name: customer.username,
        password: customer.password,
        service: 'pppoe',
        profile: plan.pppProfile,
        callerId: '',
        limitBytesIn: 0,
        limitBytesOut: 0,
        limitBytesTotal: 0,
        disabled: customer.status !== 'ACTIVE',
        comment: customer.name || customer.username
      });

      // Update customer with PPPoE secret ID
      await db.customer.update({
        where: { id: customer.id },
        data: { pppoeSecret: secretId }
      });

      // Clear cache
      clearMikroTikCache(this.router.id);

      return secretId;
    } catch (error) {
      console.error('Error creating PPPoE user:', error);
      throw error;
    }
  }

  async updatePPPoEUser(customer: Customer): Promise<void> {
    if (!customer.pppoeSecret) {
      throw new Error('Customer has no PPPoE secret ID');
    }

    try {
      const plan = await db.plan.findUnique({
        where: { id: customer.planId }
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      await this.api.updatePPPoESecret(customer.pppoeSecret, {
        name: customer.username,
        password: customer.password,
        profile: plan.pppProfile,
        disabled: customer.status !== 'ACTIVE',
        comment: customer.name || customer.username
      });

      // Clear cache
      clearMikroTikCache(this.router.id);
    } catch (error) {
      console.error('Error updating PPPoE user:', error);
      throw error;
    }
  }

  async disablePPPoEUser(customer: Customer): Promise<void> {
    if (!customer.pppoeSecret) {
      throw new Error('Customer has no PPPoE secret ID');
    }

    try {
      await this.api.disablePPPoESecret(customer.pppoeSecret);
      
      // Update customer status
      await db.customer.update({
        where: { id: customer.id },
        data: { status: 'SUSPENDED' }
      });

      // Clear cache
      clearMikroTikCache(this.router.id);
    } catch (error) {
      console.error('Error disabling PPPoE user:', error);
      throw error;
    }
  }

  async enablePPPoEUser(customer: Customer): Promise<void> {
    if (!customer.pppoeSecret) {
      throw new Error('Customer has no PPPoE secret ID');
    }

    try {
      await this.api.enablePPPoESecret(customer.pppoeSecret);
      
      // Update customer status
      await db.customer.update({
        where: { id: customer.id },
        data: { status: 'ACTIVE' }
      });

      // Clear cache
      clearMikroTikCache(this.router.id);
    } catch (error) {
      console.error('Error enabling PPPoE user:', error);
      throw error;
    }
  }

  async deletePPPoEUser(customer: Customer): Promise<void> {
    if (!customer.pppoeSecret) {
      throw new Error('Customer has no PPPoE secret ID');
    }

    try {
      await this.api.removePPPoESecret(customer.pppoeSecret);
      
      // Clear cache
      clearMikroTikCache(this.router.id);
    } catch (error) {
      console.error('Error deleting PPPoE user:', error);
      throw error;
    }
  }

  async getActiveSessions(): Promise<PPPoEActive[]> {
    try {
      return await cachedMikroTikCall(this.router, 'ppp-actives', () => 
        this.api.getPPPoEActives()
      );
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.api.connect();
      await this.api.getPPPoESecrets(); // Test command
      await this.api.disconnect();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private async findPlanByProfile(profile: string): Promise<Plan | null> {
    return await db.plan.findFirst({
      where: { pppProfile: profile, isActive: true }
    });
  }
}

// Factory function to create MikroTik service
export function createMikroTikService(router: Router): MikroTikService {
  return new MikroTikService(router);
}