"use client";

import Link from "next/link";
import { Mic2, LayoutDashboard, PlusCircle, Settings, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Nuevo Agente", href: "/agents/new", icon: PlusCircle },
  ];

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md">
              <Mic2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-lg font-bold text-[#333]">
              AI<span className="text-primary">Voice</span>24
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="ghost" className="gap-2 px-2 hover:bg-transparent">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              JD
            </div>
            <span className="text-sm font-medium text-[#333] hidden sm:inline">Juan Pérez</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}