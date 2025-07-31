"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      const userRole = session.user?.role;
      if (userRole === "ISP_OWNER") {
        router.push("/dashboard");
      } else if (userRole === "CUSTOMER") {
        router.push("/customer/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="ISP Manager Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">ISP Manager</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}