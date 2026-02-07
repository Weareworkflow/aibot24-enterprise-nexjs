
"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIAgent, KnowledgeFile } from "@/lib/types";
import { UploadCloud, FileText, FileSpreadsheet, Paperclip, Trash2, Database, ShieldCheck, Zap } from "lucide-react";

interface KnowledgeSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
}

export function KnowledgeSection({ agent, onUpdate }: KnowledgeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: KnowledgeFile[] = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadedAt: new Date().toISOString()
    }));

    const updatedFiles = [...(agent.knowledgeFiles || []), ...newFiles];
    onUpdate('knowledgeFiles', updatedFiles, 'Archivos de Conocimiento');
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    if (!agent.knowledgeFiles) return;
    const updatedFiles = agent.knowledgeFiles.filter((_, i) => i !== index);
    onUpdate('knowledgeFiles', updatedFiles, 'Archivo removido');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <Paperclip className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/5 shadow-sm">
            <Database className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <Label className="text-[11px] font-black uppercase text-foreground tracking-[0.15em]">Base de Conocimiento Externa</Label>
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Documentos de entrenamiento adicionales</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border shadow-sm">
          <ShieldCheck className="h-3 w-3 text-accent" /> Encriptación AES-256
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative overflow-hidden border-2 border-dashed border-border rounded-[3rem] p-20 flex flex-col items-center justify-center gap-6 bg-muted/20 hover:bg-muted/40 hover:border-secondary transition-all cursor-pointer shadow-inner"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <input 
          type="file" 
          multiple 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        <div className="h-24 w-24 rounded-[2.5rem] bg-card shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-border/40">
          <UploadCloud className="h-10 w-10 text-secondary" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-[14px] font-black uppercase tracking-wider text-foreground">Cargar Activos de Entrenamiento</p>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-3 bg-muted/60 px-4 py-1 rounded-full border border-border/40">Formatos soportados: PDF • Excel • Word • CSV</p>
        </div>
      </div>

      {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
        <div className="grid gap-4">
          <div className="flex items-center gap-2 px-2 pb-2">
            <Zap className="h-3 w-3 text-accent" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Índice de archivos ({agent.knowledgeFiles.length})</span>
          </div>
          {agent.knowledgeFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-card border border-border/60 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all group animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-6 overflow-hidden">
                <div className="h-14 w-14 rounded-[1.5rem] bg-muted/50 flex items-center justify-center border border-border/40 shadow-inner group-hover:bg-muted/80 transition-colors">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-black truncate text-foreground mb-1">{file.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{file.size}</span>
                    <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-accent tracking-widest">Protocolo Indexado</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
