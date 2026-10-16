import React from "react";
import Link from "next/link";
import {
  Boxes,
  ArrowRight,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardHomePage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          NexOne ERP Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">
          Welcome to the multi-tenant NexOne ERP inventory and enterprise management system.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Master Items
            </CardTitle>
            <Boxes className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">24</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              +4 added this session
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Inventory Active SKUs
            </CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">22</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              91.6% operational coverage
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Stock Reorder Alerts
            </CardTitle>
            <AlertTriangle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">3</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Items below min stock threshold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Companies
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">3</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              101 Alpha, 102 Beta, 103 Gamma
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                Implemented
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                Inventory Module
              </span>
            </div>
            <CardTitle className="text-lg">Item Master Data</CardTitle>
            <CardDescription className="text-xs">
              Common item master with company-specific inventory, accounting,
              and sales settings. Manage UOM conversions, supplier pricing, and
              multi-company allocations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="size-3.5 text-primary" />
              <span>Full CRUD, TanStack Table v8, CSV Export, Quick Search</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="size-3.5 text-primary" />
              <span>6-Tab detailed record editor with modal validations</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/inventory/item-details">
              <Button size="sm" className="gap-2">
                Open Item Details
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-muted/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                ERP Roadmap
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                Django Ninja Backend
              </span>
            </div>
            <CardTitle className="text-lg">Connected Architecture</CardTitle>
            <CardDescription className="text-xs">
              This frontend strictly implements the BFF pattern and cleanly separates
              presentation from backend logic. Set NEXT_PUBLIC_USE_MOCK=false to connect
              to the Python Django Ninja backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              • Permissions are gated both at licensing and user activity level.
            </p>
            <p>
              • Try the dev-only Persona Switcher in the top-right user menu to
              inspect permission states.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/inventory/item-details/new">
              <Button variant="outline" size="sm" className="gap-2">
                Create New Item
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
