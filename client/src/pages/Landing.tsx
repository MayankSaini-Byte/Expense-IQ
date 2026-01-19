import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Wallet, PieChart, Smartphone, ShieldCheck } from "lucide-react";
import heroImage from "@assets/hero_landing.jpg"; // Placeholder path, assumes dynamic import or handled by build

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Background Color */}
      <div className="bg-primary h-64 md:h-80 w-full relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="bg-white/20 p-2 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Expense IQ</span>
          </div>
        </div>
      </div>

      {/* Hero Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 md:-mt-52 relative z-10 pb-24">
        <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden">
          <div className="p-8 md:p-16 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6">
              Get Insights on your Data
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Track expenses effortlessly, scan UPI screenshots, and get behavioral insights to stop impulsive spending. Built for student life.
            </p>
            
            <div className="space-y-6 max-w-sm mx-auto mb-12">
              <div className="space-y-4">
                <div className="relative">
                  <Input 
                    placeholder="Username" 
                    className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary text-lg px-6"
                  />
                </div>
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="Password" 
                    className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary text-lg px-6"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <a href="/api/login">
                  <Button size="lg" className="w-full h-14 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                    LOGIN
                  </Button>
                </a>
                
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" className="text-primary font-medium">Forgot Password?</Button>
                  <Button variant="ghost" className="text-primary font-medium">Sign Up</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border/50">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">UPI Magic</h3>
                <p className="text-sm text-muted-foreground">Auto-logs from your payment SMS</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Behavioral</h3>
                <p className="text-sm text-muted-foreground">Stop impulsive spending habits</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Student Optimized</h3>
                <p className="text-sm text-muted-foreground">Simple and quick tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
