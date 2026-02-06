
"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIAgent, KnowledgeFile } from "@/lib/types";
import { UploadCloud, FileText, FileSpreadsheet, Paperclip, Trash2, Database } from "lucide-react";

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
    onUpdate('knowledgeFiles', updatedFiles, 'Archivo eliminado');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <Paperclip className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-secondary" />
          <Label className="text-[10px] font-black uppercase text-slate-800 tracking-[0.2em]">Gestión de Conocimiento Externo</Label>
        </div>
        <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {agent.knowledgeFiles?.length || 0} Archivos
        </span>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative overflow-hidden border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 bg-white hover:bg-slate-50 hover:border-secondary/40 transition-all cursor-pointer shadow-sm"
      >
        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <input 
          type="file" 
          multiple 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <UploadCloud className="h-8 w-8 text-secondary" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-[11px] font-bold text-slate-700">Cargar Archivos de Conocimiento</p>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">PDF, Excel, Word o Texto plano</p>
        </div>
      </div>

      {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
        <div className="grid gap-3">
          {agent.knowledgeFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-bold truncate text-slate-700">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{file.size}</span>
                    <span className="text-[8px] text-slate-300">•</span>
                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Sincronizado</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 pill-rounded text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
