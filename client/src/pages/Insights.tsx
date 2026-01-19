import { useStats } from "@/hooks/use-stats";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPieChart, MonthlyBarChart } from "@/components/Charts";
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Insights() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Financial Insights</h1>
        <p className="text-muted-foreground">Deep dive into your spending habits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights List */}
          <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>Behavioral patterns detected in your spending</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No insights generated yet. Add more expenses to get analysis!
                </div>
              ) : (
                stats.insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className="flex gap-4 p-4 rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={`mt-1 shrink-0 ${
                      insight.type === 'warning' ? 'text-orange-500' : 
                      insight.type === 'success' ? 'text-green-500' : 
                      'text-blue-500'
                    }`}>
                      {insight.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
                       insight.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                       <Wallet className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {insight.type === 'warning' ? 'Spending Alert' : 
                         insight.type === 'success' ? 'Good Habit' : 
                         'Observation'}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <MonthlyBarChart data={stats.monthlyStats} />
        </div>

        <div className="space-y-6">
          <CategoryPieChart data={stats.categoryStats} />
          
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Budget Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="opacity-90 mb-4">
                Based on your current spending, try to limit "Food" expenses to ₹200/day to save ₹1,500 this month.
              </p>
              <Button variant="secondary" className="w-full text-primary font-bold" asChild>
                <Link href="/expenses">Review Expenses <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
