import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CategoryStat {
  category: string;
  total: number;
  percentage: number;
}

interface MonthlyStat {
  month: string;
  total: number;
}

const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#6366F1', '#94A3B8'];

export function CategoryPieChart({ data }: { data: CategoryStat[] }) {
  if (!data.length) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Where your money goes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="total"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="flex-1 truncate">{item.category}</span>
              <span className="font-semibold">{Math.round(item.percentage)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyStat[] }) {
  if (!data.length) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
        <CardDescription>Your spending over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`₹${value}`, 'Total']}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
