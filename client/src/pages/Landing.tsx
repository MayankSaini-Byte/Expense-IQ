import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, PieChart, Smartphone, ShieldCheck } from "lucide-react";
import heroImage from "@assets/hero_landing.jpg"; // Placeholder path, assumes dynamic import or handled by build

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Expense IQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/login">
              <Button>Login / Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Master your student budget with <span className="text-primary">AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Track expenses effortlessly, scan UPI screenshots, and get behavioral insights to stop impulsive spending. Built for student life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/api/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10" />
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Why Expense IQ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We understand student finances. It's not just about tracking, it's about changing habits.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">UPI Magic</h3>
              <p className="text-muted-foreground">Paste your UPI payment SMS or screenshot text, and our AI automatically logs amount, category, and date.</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                <PieChart className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Behavioral Insights</h3>
              <p className="text-muted-foreground">We don't just show charts. We tell you if you're spending too much on food late at night or impulsive shopping.</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Student Optimized</h3>
              <p className="text-muted-foreground">Simple categories, quick-add buttons, and mobile-first design. Perfect for life on the go.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
