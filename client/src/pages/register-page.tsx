import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Must be a valid email"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirm: z.string(),
    dietary: z
      .enum(["none", "vegetarian", "vegan", "halal", "kosher", "gluten_free"])
      .default("none"),
    typicalLunch: z
      .enum(["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"])
      .default("12:00"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type RegisterFormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirm: "",
      dietary: "none",
      typicalLunch: "12:00",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/register", data);
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Welcome to Never Eat Solo!",
        });
        navigate("/");
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-primary">Create your account</h1>
          <p className="mt-2 text-zinc-400">Join the Never Eat Solo community</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dietary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary preference</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No preference</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="halal">Halal</SelectItem>
                        <SelectItem value="kosher">Kosher</SelectItem>
                        <SelectItem value="gluten_free">Gluten-free</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="typicalLunch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typical lunch time</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="11:30">11:30</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="12:30">12:30</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="13:30">13:30</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <p className="text-zinc-400">
            Already have an account?{" "}
            <a href="/auth" className="text-primary hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}