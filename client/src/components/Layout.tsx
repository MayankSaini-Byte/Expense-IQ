import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  LogOut, 
  Menu,
  X,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Insights", href: "/insights", icon: TrendingUp },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <WalletCards className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Expense IQ</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "" : "group-hover:text-primary transition-colors"}`} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary/5 text-primary">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.firstName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 fixed h-full z-30">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-40">
          <Button size="icon" variant="outline" className="shadow-lg bg-background/80 backdrop-blur-md">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 md:p-8 pt-20 lg:pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
