import Link from "next/link";
import { Mic2, ArrowRight, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Mic2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline text-2xl font-bold text-primary">AIVoice24</span>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Sign In</Link>
        </Button>
      </nav>

      <main className="flex-1">
        <section className="py-20 lg:py-32 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium border border-secondary/20">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Voice Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-foreground leading-[1.1]">
              Deploy World-Class <span className="text-primary">AI Voice Agents</span> in Seconds
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empower your business with customizable AI voice agents that sound natural, 
              understand context, and resolve customer queries instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-medium rounded-xl shadow-lg shadow-primary/20" asChild>
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-xl" asChild>
                <Link href="/agents/new">Create Agent</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">GenAI Configuration</h3>
                <p className="text-muted-foreground">
                  Intelligently infer personality traits and knowledge bases using our advanced LLM configuration tool.
                </p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">Real-time Testing</h3>
                <p className="text-muted-foreground">
                  Test your agents immediately in an interactive chat environment before deployment.
                </p>
              </div>
              <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">Enterprise Metrics</h3>
                <p className="text-muted-foreground">
                  Track performance, usage, and customer satisfaction with our comprehensive analytics suite.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold">AIVoice24</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AIVoice24. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}