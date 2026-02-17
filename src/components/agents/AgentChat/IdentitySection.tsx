
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, User, Briefcase, Building2, Palette, Sparkles, Save, Camera, Upload, X } from "lucide-react";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface IdentitySectionProps {
  agent: AIAgent;
  onUpdate: (updates: Partial<AIAgent>, title?: string) => void;
}

const ASSISTANT_COLORS = [
  "#1B75BB", "#41E0F0", "#2FC6F6", "#22c55e", "#10b981",
  "#3b82f6", "#ef4444", "#f97316", "#a855f7", "#06b6d4",
  "#ec4899", "#84cc16", "#78350f", "#1e293b", "#475569", "#94a3b8"
];

export function IdentitySection({ agent, onUpdate }: IdentitySectionProps) {
  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [company, setCompany] = useState(agent.company);
  const [color, setColor] = useState(agent.color);
  const [avatar, setAvatar] = useState(agent.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when agent changes from external sources (e.g. initial load or refiner)
  useEffect(() => {
    setName(agent.name);
    setRole(agent.role);
    setCompany(agent.company);
    setColor(agent.color);
    setAvatar(agent.avatar);
  }, [agent]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      alert("La imagen no debe superar 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    onUpdate({
      name,
      role,
      company,
      color,
      avatar
    }, "Identidad del Agente");
  };

  const hasChanges = name !== agent.name || role !== agent.role || company !== agent.company || color !== agent.color || avatar !== agent.avatar;

  return (
    <div className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-border/50 shadow-lg transition-transform hover:scale-105">
            <AvatarImage src={avatar} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="absolute -bottom-2 -right-2 flex gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-background border-border shadow-sm hover:bg-secondary hover:text-white transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            {avatar && (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-background border-border shadow-sm hover:bg-destructive hover:text-white transition-colors"
                onClick={handleRemoveAvatar}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Foto de Perfil
        </p>
      </div>

      {/* Datos Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Nombre Operativo</Label>
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-sm font-bold bg-muted/30 border-border rounded-[1.2rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-card"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Rol / Especialidad</Label>
          </div>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-12 text-sm font-bold bg-muted/30 border-border rounded-[1.2rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-card"
          />
        </div>
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Organización Representada</Label>
          </div>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-12 text-sm font-bold bg-muted/30 border-border rounded-[1.2rem] focus-visible:ring-1 focus-visible:ring-secondary/20 px-6 transition-all hover:bg-card"
          />
        </div>
      </div>

      {/* ADN Visual */}
      <div className="pt-6 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.15em]">ADN Visual</Label>
          </div>
          <Sparkles className="h-3 w-3 text-secondary/40 animate-pulse" />
        </div>
        <div className="flex flex-wrap gap-3">
          {ASSISTANT_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "h-9 w-9 rounded-[0.8rem] border-2 shadow-sm transition-all hover:scale-110 flex items-center justify-center relative",
                color === c ? "border-secondary ring-4 ring-secondary/10" : "border-background"
              )}
              style={{ backgroundColor: c }}
            >
              {color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="gap-2 bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20"
        >
          <Save className="h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
