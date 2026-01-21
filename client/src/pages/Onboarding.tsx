import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const onboardingSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    age: z.coerce.number().min(16, "You must be at least 16").max(120),
    occupation: z.string().min(1, "Occupation is required"),
    monthlyBudget: z.coerce.number().min(0, "Budget cannot be negative").default(0),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();

    const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            age: 18,
            occupation: "",
            monthlyBudget: 0,
        },
    });

    async function onSubmit(data: OnboardingFormData) {
        try {
            const res = await apiRequest("POST", "/api/user/onboarding", data);
            if (res.ok) {
                // Invalidate user query to refetch updated profile
                queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                toast({
                    title: "Profile Updated",
                    description: "Welcome! Your profile has been set up.",
                });
                setLocation("/");
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save your details. Please try again.",
            });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome! Let's get to know you.</CardTitle>
                    <CardDescription>
                        Please tell us a bit about yourself to personalize your experience.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Student, Engineer, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="monthlyBudget"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Budget</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Complete Setup
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
