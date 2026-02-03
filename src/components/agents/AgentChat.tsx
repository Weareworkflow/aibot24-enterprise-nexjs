"use client";

import { useState, useRef, useEffect } from "react";
import { AIAgent, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Mic, Loader2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentChatProps {
  agent: AIAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isVoice = agent.type === 'voice';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Hola, soy ${agent.name}. Como agente de ${isVoice ? 'voz' : 'texto'}, he procesado tu mensaje siguiendo mi estilo: ${agent.responseStyle}.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full border rounded-2xl bg-white shadow-inner overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", isVoice ? "bg-primary" : "bg-secondary")}>
            {isVoice ? <Mic className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold font-headline">{agent.name}</h3>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse" />
              {isVoice ? 'Voice Ready' : 'Chat Online'}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 h-[400px]" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-50 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entorno de Pruebas</p>
              <p className="text-xs">Interactúa con el agente para validar su personalidad.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2 rounded-2xl text-xs shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none border"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-none border flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">IA pensando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          {isVoice && (
            <Button size="icon" variant="ghost" className="rounded-full text-primary hover:bg-primary/10">
              <Mic className="h-5 w-5" />
            </Button>
          )}
          <Input 
            placeholder={isVoice ? "Habla o escribe para probar..." : "Escribe un mensaje..."} 
            className="flex-1 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 text-xs"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            size="icon" 
            className={cn("rounded-full h-9 w-9 flex-shrink-0", isVoice ? "bg-primary" : "bg-secondary")}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
