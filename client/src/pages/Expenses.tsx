import { useExpenses, useDeleteExpense, useUpdateExpense } from "@/hooks/use-expenses";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/ExpenseForm";
import { format } from "date-fns";
import { 
  Search, 
  Trash2, 
  Edit2, 
  Filter, 
  CalendarIcon,
  Loader2 
} from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Expenses() {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const { data: expenses, isLoading } = useExpenses({ 
    category: categoryFilter === "all" ? undefined : categoryFilter,
    startDate: date ? format(date, "yyyy-MM-dd") : undefined
  });
  
  const deleteExpense = useDeleteExpense();
  const updateExpense = useUpdateExpense();

  const handleUpdate = async (data: any) => {
    if (!editingExpense) return;
    await updateExpense.mutateAsync({ id: editingExpense.id, ...data });
    setEditingExpense(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense.mutateAsync(id);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Expenses</h1>
          <p className="text-muted-foreground">Manage and track your transaction history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-9" />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Academics">Academics</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Filter by Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(categoryFilter || date) && (
          <Button variant="ghost" onClick={() => { setCategoryFilter("all"); setDate(undefined); }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : expenses?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground text-lg">No expenses found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Note</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {expenses?.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                      <div className="text-xs text-muted-foreground">{format(new Date(expense.date), "h:mm a")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">
                      {expense.note || "-"}
                      {expense.paymentType === 'upi' && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 border border-border px-1 rounded">UPI</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-base">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleteExpense.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm 
              defaultValues={editingExpense} 
              onSubmit={handleUpdate} 
              isLoading={updateExpense.isPending}
              submitLabel="Update Expense"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
