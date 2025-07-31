"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Router, User } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [ispOwnerForm, setIspOwnerForm] = useState({
    email: "",
    password: "",
  });

  const [customerForm, setCustomerForm] = useState({
    username: "",
    password: "",
  });

  const handleIspOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: ispOwnerForm.email,
        password: ispOwnerForm.password,
        role: "ISP_OWNER",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: customerForm.username,
        password: customerForm.password,
        role: "CUSTOMER",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        toast.error("Invalid username or password");
      } else {
        toast.success("Welcome back!");
        router.push("/customer/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Router className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">ISP Manager</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive ISP billing and management system
          </p>
        </div>

        <Card>
          <Tabs defaultValue="isp-owner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="isp-owner" className="flex items-center gap-2">
                <Router className="h-4 w-4" />
                ISP Owner
              </TabsTrigger>
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="isp-owner">
              <form onSubmit={handleIspOwnerLogin}>
                <CardHeader>
                  <CardTitle>ISP Owner Login</CardTitle>
                  <CardDescription>
                    Enter your email and password to access the management portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={ispOwnerForm.email}
                      onChange={(e) =>
                        setIspOwnerForm({ ...ispOwnerForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={ispOwnerForm.password}
                      onChange={(e) =>
                        setIspOwnerForm({ ...ispOwnerForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="customer">
              <form onSubmit={handleCustomerLogin}>
                <CardHeader>
                  <CardTitle>Customer Login</CardTitle>
                  <CardDescription>
                    Enter your PPPoE username and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="username">PPPoE Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={customerForm.username}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input
                      id="customer-password"
                      type="password"
                      placeholder="Enter your password"
                      value={customerForm.password}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Default ISP Owner: admin@isp.com / password</p>
          <p>Use your PPPoE credentials for customer login</p>
        </div>
      </div>
    </div>
  );
}