
"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIAgent, KnowledgeFile } from "@/lib/types";
import { UploadCloud, FileText, FileSpreadsheet, Paperclip, Trash2 } from "lucide-react";

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
    <div className="space-y-4">
      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Gestión de Archivos de Conocimiento</Label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
      >
        <input 
          type="file" 
          multiple 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        <UploadCloud className="h-8 w-8 text-secondary" />
        <div className="text-center">
          <p className="text-xs font-bold text-slate-600">Subir archivos para el agente</p>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">PDF, DOC, Excel, TXT</p>
        </div>
      </div>

      {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 && (
        <div className="grid gap-2">
          {agent.knowledgeFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                {getFileIcon(file.type)}
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-bold truncate">{file.name}</span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{file.size}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
