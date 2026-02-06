"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIAgent, KnowledgeFile } from "@/lib/types";
import { UploadCloud, FileText, FileSpreadsheet, Paperclip, Trash2, Database, ShieldCheck } from "lucide-react";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-secondary" />
          </div>
          <Label className="text-[11px] font-black uppercase text-slate-700 tracking-[0.15em]">Base de Conocimiento Externa</Label>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full border">
          <ShieldCheck className="h-3 w-3 text-accent" /> Encriptación Activa
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative overflow-hidden border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-5 bg-slate-50/50 hover:bg-white hover:border-secondary transition-all cursor-pointer shadow-inner hover:shadow-xl"
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
        <div className="h-20 w-20 rounded-[2rem] bg-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <UploadCloud className="h-10 w-10 text-secondary" />
        </div>
        <div className="text-center relative z-10">
          <p className="text-[13px] font-bold text-slate-800">Cargar Archivos de Entrenamiento</p>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-2">Arrastra o selecciona documentos PDF, Excel o Word</p>
        </div>
      </div>

      {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
        <div className="grid gap-4">
          {agent.knowledgeFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-lg transition-all group animate-in fade-in slide-in-from-left-4">
              <div className="flex items-center gap-5 overflow-hidden">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 shadow-inner">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[12px] font-bold truncate text-slate-800 mb-1">{file.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{file.size}</span>
                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                    <span className="text-[9px] font-black uppercase text-accent tracking-widest">Indexado</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}