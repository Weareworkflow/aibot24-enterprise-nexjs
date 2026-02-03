"use client";

import { useState, useRef, useEffect } from "react";
import { VoiceAgent, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentChatProps {
  agent: VoiceAgent;
}

export function AgentChat({ agent }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `As ${agent.name}, I understand your request. Based on my personality as ${agent.personality}, I would respond to: "${input}" in my typical style: ${agent.responseStyle}.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full border rounded-2xl bg-white shadow-inner overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-headline">{agent.name}</h3>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse" />
              Agent Online
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 h-[400px]" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-50 space-y-2">
              <p className="text-sm">No messages yet. Start testing your agent below.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Tell me about yourself", "How can you help me?", "What's your specialty?"].map((tip) => (
                  <button 
                    key={tip}
                    onClick={() => setInput(tip)}
                    className="px-3 py-1 bg-muted rounded-full text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    "{tip}"
                  </button>
                ))}
              </div>
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
                  "px-4 py-2 rounded-2xl text-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground">
            <Mic className="h-5 w-5" />
          </Button>
          <Input 
            placeholder="Type your message to test agent..." 
            className="flex-1 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            size="icon" 
            className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10 flex-shrink-0"
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