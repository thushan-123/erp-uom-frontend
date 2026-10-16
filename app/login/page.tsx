"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Boxes, Lock, User, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/inventory/item-details";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.detail || "Authentication failed");
        return;
      }

      toast.success("Welcome back to NexOne ERP!");
      router.push(from);
      router.refresh();
    } catch {
      toast.error("Failed to authenticate. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (username: string) => {
    setValue("username", username);
    setValue("password", "password123");
  };

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <Boxes className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          NexOne ERP
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your credentials to access the enterprise portal
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="username"
                placeholder="admin"
                className="pl-8 text-xs"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-[11px] text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-8 text-xs"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Dev Demo Quick Fill */}
          <div className="rounded-md border border-dashed bg-muted/30 p-2.5">
            <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Demo Personas:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => handleQuickFill("admin")}
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => handleQuickFill("inventory")}
              >
                Inventory
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => handleQuickFill("sales")}
              >
                Sales
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full text-xs" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
