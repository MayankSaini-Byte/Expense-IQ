import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertExpenseSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useParseUPI } from "@/hooks/use-expenses";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Food",
  "Travel",
  "Academics",
  "Entertainment",
  "Essentials",
  "Shopping",
  "Misc"
];

// Extending schema to handle string inputs for numbers (form behavior)
const formSchema = insertExpenseSchema.extend({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function ExpenseForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save Expense" }: ExpenseFormProps) {
  const { toast } = useToast();
  const parseUPIMutation = useParseUPI();
  const [activeTab, setActiveTab] = useState("manual");
  const [upiMessage, setUpiMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      category: "Food",
      note: "",
      paymentType: "manual",
      isImpulsive: false,
      date: new Date(),
      ...defaultValues,
    },
  });

  const handleParseUPI = async () => {
    if (!upiMessage.trim()) return;
    
    try {
      const result = await parseUPIMutation.mutateAsync({ message: upiMessage });
      form.setValue("amount", result.amount);
      form.setValue("category", result.category);
      form.setValue("note", result.note);
      form.setValue("date", new Date(result.date));
      form.setValue("paymentType", "upi");
      form.setValue("rawMessage", result.originalMessage);
      
      toast({
        title: "Parsed Successfully",
        description: `Found ₹${result.amount} for ${result.category}`,
      });
      setActiveTab("manual"); // Switch to manual to review
    } catch (error) {
      toast({
        title: "Parsing Failed",
        description: error instanceof Error ? error.message : "Could not parse message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upi">UPI / SMS Scan</TabsTrigger>
        </TabsList>

        <TabsContent value="upi" className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-xl border border-dashed border-border">
            <label className="text-sm font-medium mb-2 block">Paste Transaction SMS</label>
            <Textarea 
              placeholder="e.g. Paid Rs. 250 to Zomato via UPI..." 
              className="min-h-[120px] bg-background mb-4"
              value={upiMessage}
              onChange={(e) => setUpiMessage(e.target.value)}
            />
            <Button 
              onClick={handleParseUPI} 
              disabled={parseUPIMutation.isPending || !upiMessage}
              className="w-full gap-2"
            >
              {parseUPIMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Analyze Message
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              AI will extract amount, merchant, and categorize it for you.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                        <Input type="number" step="0.01" className="pl-8 text-lg font-medium" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "manual"}
                        defaultValue={field.value || "manual"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual / Cash</SelectItem>
                          <SelectItem value="upi">UPI / Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Input placeholder="Lunch at canteen, Uber to mall..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 h-12 text-lg"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {submitLabel}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
