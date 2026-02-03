"use client";

import Link from "next/link";
import { Mic2, LayoutDashboard, PlusCircle, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Agent", href: "/agents/new", icon: PlusCircle },
  ];

  return (
    <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Mic2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold text-primary">AIVoice24</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
          <div className="h-6 w-px bg-border mx-2" />
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}