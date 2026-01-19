import { useStats } from "@/hooks/use-stats";
import { useCreateExpense } from "@/hooks/use-expenses";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { CategoryPieChart, MonthlyBarChart } from "@/components/Charts";
import { 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  Wallet,
  ArrowUpRight,
  Utensils,
  Plane,
  ShoppingBag,
  Info
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const createExpense = useCreateExpense();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    await createExpense.mutateAsync(data);
    setIsAddOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'travel': return <Plane className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial health</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg shadow-primary/25 rounded-full px-6">
              <Plus className="mr-2 h-5 w-5" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSubmit={handleSubmit} isLoading={createExpense.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-xl shadow-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">₹{stats.totalSpent.toLocaleString()}</div>
            <p className="text-sm opacity-80 mt-1">This month so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display flex items-center gap-2">
              {stats.categoryStats[0]?.category || "None"}
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {stats.categoryStats[0] ? `${Math.round(stats.categoryStats[0].percentage)}%` : "0%"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ₹{stats.categoryStats[0]?.total.toLocaleString() || 0} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              ₹{Math.round(stats.totalSpent / new Date().getDate()).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Per day this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section - Only show if there are insights */}
      {stats.insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> 
            Smart Insights
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${
                insight.type === 'warning' ? 'border-l-orange-500 bg-orange-50/50' : 
                insight.type === 'success' ? 'border-l-green-500 bg-green-50/50' : 
                'border-l-blue-500 bg-blue-50/50'
              }`}>
                <CardContent className="p-4 flex items-start gap-3">
                  {insight.type === 'warning' ? <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" /> : 
                   insight.type === 'success' ? <TrendingDown className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> :
                   <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium leading-relaxed">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[400px]">
             <MonthlyBarChart data={stats.monthlyStats} />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Transactions</h2>
              <Button variant="ghost" size="sm" asChild>
                <a href="/expenses" className="text-primary">View All</a>
              </Button>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {stats.recentExpenses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No expenses yet. Add one to get started!</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {stats.recentExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p className="font-medium">{expense.note || expense.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), "MMM d, h:mm a")} • {expense.paymentType === 'upi' ? 'UPI' : 'Cash'}
                          </p>
                        </div>
                      </div>
                      <div className="font-bold text-right">
                        -₹{Number(expense.amount).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <CategoryPieChart data={stats.categoryStats} />
        </div>
      </div>
    </Layout>
  );
}
