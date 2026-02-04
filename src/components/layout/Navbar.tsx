
"use client";

import Link from "next/link";
import { Plus, Search, LogIn, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { useUIStore } from "@/lib/store";
import { useAuth, useUser } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useUIStore();
  const auth = useAuth();
  const { user, loading } = useUser();

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
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
              placeholder="Buscar agentes, roles o empresas..." 
              className="w-full h-8 pl-9 bg-[#F0F3F5] border-none rounded-md text-[11px] focus-visible:ring-1 focus-visible:ring-secondary/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/agents/new"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all tracking-wider",
              "bg-secondary/15 text-secondary hover:bg-secondary/25",
              pathname === "/agents/new" && "bg-secondary/30"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Nuevo Agente</span>
          </Link>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full premium-relief p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-secondary/10 text-secondary text-[10px] font-black">
                        {user.displayName?.charAt(0) || <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 rounded-2xl p-2 shadow-2xl border-none" align="end">
                  <div className="px-3 py-2 space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operador Activo</p>
                    <p className="text-xs font-bold truncate">{user.displayName || user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 rounded-xl cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Desconectar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleLogin}
                variant="outline" 
                className="h-8 pill-rounded border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-secondary/5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Acceso
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
