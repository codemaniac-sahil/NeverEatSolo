import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, MapPin, Users } from "lucide-react";
import { loginWithMicrosoft, handleRedirectResponse } from "@/services/microsoft-auth";

// Extend the schemas to add validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isProcessingMicrosoftAuth, setIsProcessingMicrosoftAuth] = useState(false);
  
  // Function to continue without registration (demo mode)
  const continueWithoutRegistration = () => {
    navigate("/");
  };

  // Handle Microsoft authentication redirect
  useEffect(() => {
    async function handleMicrosoftRedirect() {
      try {
        setIsProcessingMicrosoftAuth(true);
        const response = await handleRedirectResponse();
        if (response) {
          console.log("Microsoft authentication successful, getting user info");
          
          try {
            // Get account data from the token
            const account = response.account;
            const name = account.name || '';
            const email = account.username || '';
            const microsoftId = account.homeAccountId || '';
            const accessToken = response.accessToken;
            
            // Call our backend to login or register with Microsoft
            const res = await fetch('/api/auth/microsoft', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                microsoftId,
                email,
                displayName: name,
                accessToken,
                refreshToken: '', // We'd need a refresh token flow to get this
              }),
            });
            
            if (res.ok) {
              // Reload the user state from the auth context
              window.location.href = '/';
            } else {
              const errorData = await res.json();
              console.error('Microsoft auth failed:', errorData);
            }
          } catch (err) {
            console.error('Error during Microsoft authentication with backend:', err);
          }
        }
      } catch (error) {
        console.error("Error handling Microsoft redirect:", error);
      } finally {
        setIsProcessingMicrosoftAuth(false);
      }
    }

    handleMicrosoftRedirect();
  }, [navigate]);

  // Handle Microsoft login button click
  const handleMicrosoftLogin = async () => {
    try {
      await loginWithMicrosoft();
    } catch (error) {
      console.error("Error logging in with Microsoft:", error);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword and agreeToTerms fields
    const { confirmPassword, agreeToTerms, ...userData } = data;
    
    // Log registration data to help diagnose issues
    console.log("Registration data:", userData);
    
    // Submit registration data
    registerMutation.mutate(userData);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Hero section */}
      <div className="md:w-1/2 bg-primary relative overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/50 z-0"></div>
        <div className="bg-[url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70')] bg-cover bg-center absolute inset-0 mix-blend-soft-light opacity-80"></div>
        
        <div className="relative z-10 text-white max-w-md">
          <h1 className="font-bold text-4xl md:text-5xl mb-4">Never Dine Alone</h1>
          <p className="text-lg mb-6">Connect with others over great meals. Because food tastes better with company.</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <Utensils className="mr-2 h-5 w-5" />
              <span>Find dining companions</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              <span>Discover local restaurants</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              <span>Make meaningful connections</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <div className="text-center mb-8">
                <h2 className="font-bold text-3xl text-neutral-800">Welcome Back</h2>
                <p className="text-neutral-700 mt-2">Sign in to continue your dining adventures</p>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="yourusername" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-700">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleMicrosoftLogin}
                    disabled={isProcessingMicrosoftAuth}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
                      <path fill="#f25022" d="M1 1h10v10H1V1z"/>
                      <path fill="#00a4ef" d="M1 13h10v10H1V13z"/>
                      <path fill="#7fba00" d="M13 1h10v10H13V1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13V13z"/>
                    </svg>
                    {isProcessingMicrosoftAuth ? "Signing in..." : "Microsoft"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-primary text-primary hover:bg-primary/5"
                  onClick={continueWithoutRegistration}
                >
                  Continue without Registration (Demo Mode)
                </Button>
                
                <p className="text-center text-sm text-neutral-700">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <div className="text-center mb-8">
                <h2 className="font-bold text-3xl text-neutral-800">Create Account</h2>
                <p className="text-neutral-700 mt-2">Join our community of food lovers</p>
              </div>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
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
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the{" "}
                            <a href="#" className="text-primary hover:underline">
                              terms and conditions
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 mt-2"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-700">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleMicrosoftLogin}
                    disabled={isProcessingMicrosoftAuth}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
                      <path fill="#f25022" d="M1 1h10v10H1V1z"/>
                      <path fill="#00a4ef" d="M1 13h10v10H1V13z"/>
                      <path fill="#7fba00" d="M13 1h10v10H13V1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13V13z"/>
                    </svg>
                    {isProcessingMicrosoftAuth ? "Signing in..." : "Register with Microsoft"}
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-primary text-primary hover:bg-primary/5"
                  onClick={continueWithoutRegistration}
                >
                  Continue without Registration (Demo Mode)
                </Button>
                
                <p className="text-center text-sm text-neutral-700">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("login")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
