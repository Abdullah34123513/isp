import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Create ISP Owner admin user
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@isp.com" }
    });

    let adminUser;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("password", 12);
      adminUser = await prisma.user.create({
        data: {
          email: "admin@isp.com",
          name: "ISP Admin",
          password: hashedPassword,
          role: "ISP_OWNER",
        },
      });
      console.log("✅ Created admin user:", adminUser.email);
    } else {
      adminUser = existingAdmin;
      console.log("✅ Admin user already exists:", adminUser.email);
    }

    // Create sample router
    const existingRouter = await prisma.router.findFirst();
    let router;
    if (!existingRouter) {
      router = await prisma.router.create({
        data: {
          name: "Main Router",
          host: "192.168.1.1",
          port: 8728,
          username: "admin",
          password: "router-password",
          isActive: true,
        },
      });
      console.log("✅ Created sample router:", router.name);
    } else {
      router = existingRouter;
      console.log("✅ Router already exists:", router.name);
    }

    // Create sample plans
    const planCount = await prisma.plan.count();
    let plans;
    if (planCount === 0) {
      plans = await Promise.all([
        prisma.plan.create({
          data: {
            name: "Basic 5M",
            description: "5 Mbps Download / 5 Mbps Upload",
            price: 19.99,
            downloadSpeed: 5,
            uploadSpeed: 5,
            dataLimit: null,
            pppProfile: "basic-5m",
            isActive: true,
          },
        }),
        prisma.plan.create({
          data: {
            name: "Standard 10M",
            description: "10 Mbps Download / 10 Mbps Upload",
            price: 39.99,
            downloadSpeed: 10,
            uploadSpeed: 10,
            dataLimit: null,
            pppProfile: "standard-10m",
            isActive: true,
          },
        }),
        prisma.plan.create({
          data: {
            name: "Premium 20M",
            description: "20 Mbps Download / 20 Mbps Upload",
            price: 59.99,
            downloadSpeed: 20,
            uploadSpeed: 20,
            dataLimit: null,
            pppProfile: "premium-20m",
            isActive: true,
          },
        }),
      ]);
      console.log("✅ Created sample plans:", plans.length);
    } else {
      plans = await prisma.plan.findMany();
      console.log("✅ Plans already exist:", plans.length);
    }

    // Create sample customers
    const customerCount = await prisma.customer.count();
    if (customerCount === 0) {
      const customers = await Promise.all([
        prisma.customer.create({
          data: {
            username: "customer1",
            password: "password1", // In production, this should be hashed
            name: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            address: "123 Main St, City, State",
            status: "ACTIVE",
            balance: 0,
            routerId: router.id,
            planId: plans[0].id,
          },
        }),
        prisma.customer.create({
          data: {
            username: "customer2",
            password: "password2", // In production, this should be hashed
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+1234567891",
            address: "456 Oak St, City, State",
            status: "ACTIVE",
            balance: 0,
            routerId: router.id,
            planId: plans[1].id,
          },
        }),
      ]);
      console.log("✅ Created sample customers:", customers.length);
    } else {
      console.log("✅ Customers already exist:", customerCount);
    }

    // Show database summary
    const userCount = await prisma.user.count();
    const routerCount = await prisma.router.count();
    const finalPlanCount = await prisma.plan.count();
    const finalCustomerCount = await prisma.customer.count();

    console.log("\n📊 Database Summary:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Routers: ${routerCount}`);
    console.log(`   Plans: ${finalPlanCount}`);
    console.log(`   Customers: ${finalCustomerCount}`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n🔐 Default Credentials:");
    console.log("   ISP Owner: admin@isp.com / password");
    console.log("   Customer 1: customer1 / password1");
    console.log("   Customer 2: customer2 / password2");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });