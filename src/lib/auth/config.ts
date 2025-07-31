import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        try {
          // Handle ISP Owner authentication (using email)
          if (credentials.role === "ISP_OWNER" && credentials.email) {
            const user = await db.user.findUnique({
              where: {
                email: credentials.email,
                role: "ISP_OWNER"
              }
            });

            if (!user) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }

          // Handle Customer authentication (using username)
          if (credentials.role === "CUSTOMER" && credentials.username) {
            const customer = await db.customer.findUnique({
              where: {
                username: credentials.username
              },
              include: {
                plan: true,
                router: true
              }
            });

            if (!customer || customer.status === "DISABLED") {
              return null;
            }

            // For customer authentication, we'll compare the password directly
            // In production, you should hash customer passwords as well
            const isPasswordValid = customer.password === credentials.password;

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: customer.id,
              username: customer.username,
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
              customerId: customer.id,
              planId: customer.planId,
              routerId: customer.routerId,
            };
          }

          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.customerId = user.customerId;
        token.planId = user.planId;
        token.routerId = user.routerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.customerId = token.customerId as string;
        session.user.planId = token.planId as string;
        session.user.routerId = token.routerId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.customerId = user.customerId;
        token.planId = user.planId;
        token.routerId = user.routerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.customerId = token.customerId as string;
        session.user.planId = token.planId as string;
        session.user.routerId = token.routerId as string;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
      username?: string;
      role: string;
      customerId?: string;
      planId?: string;
      routerId?: string;
    };
  }

  interface User {
    id: string;
    email?: string;
    name?: string;
    username?: string;
    role: string;
    customerId?: string;
    planId?: string;
    routerId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    username?: string;
    customerId?: string;
    planId?: string;
    routerId?: string;
  }
}