"use client";

import Link from "next/link";
import { Plus, Bell, MoreVertical, Search, LogIn, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth, useUser } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const auth = useAuth();
  const { user, loading } = useUser();

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <nav className="border-b bg-white border-border/60 sticky top-0 z-50 h-12 flex items-center shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Logo />
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
            <Input 
              placeholder="Buscar agentes, tareas o comandos..." 
              className="w-full h-8 pl-9 bg-[#F0F3F5] border-none rounded-md text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user && (
            <Link
              href="/agents/new"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider mr-2",
                "bg-secondary/15 text-secondary hover:bg-secondary/25",
                pathname === "/agents/new" && "bg-secondary/30"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Nuevo Agente</span>
            </Link>
          )}

          <div className="flex items-center gap-1.5 border-l pl-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7 border">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="text-[10px] font-black">
                        {user.displayName?.charAt(0) || <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                      className="h-8 w-8 rounded-md bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
                      title="Cerrar Sesión"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogin}
                    className="h-8 px-3 rounded-md border-secondary text-secondary hover:bg-secondary/5 text-[10px] font-black uppercase tracking-wider gap-2"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Acceder
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md bg-[#F8FAFC] text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}