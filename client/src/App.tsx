import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";

import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Insights from "@/pages/Insights";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

import Onboarding from "@/pages/Onboarding";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      if ((!user.age || !user.occupation || !user.monthlyBudget) && window.location.pathname !== "/onboarding") {
        setLocation("/onboarding");
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  // If verifying onboarding status, we might flicker or need a loading state, 
  // but the effect above handles redirect. 
  // We should ideally prevent rendering the component if we are redirecting.
  // But for now, let's render. 
  // ACTUALLY: If we are on a protected route (not onboarding) and data is missing, we redirect.
  // The component might render briefly. 

  if ((!user.age || !user.occupation || !user.monthlyBudget) && window.location.pathname !== "/onboarding") {
    return null; // Don't render while redirecting
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/expenses" component={() => <ProtectedRoute component={Expenses} />} />
      <Route path="/insights" component={() => <ProtectedRoute component={Insights} />} />
      <Route path="/onboarding" component={() => <ProtectedRoute component={Onboarding} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
