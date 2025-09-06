
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPossiblePhoneNumber } from 'react-phone-number-input'

// Schema for the Sign Up form
const SignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.coerce.number().min(1, "Age is required"),
  phone: z.string().refine(phone => isPossiblePhoneNumber(phone || ''), {
      message: 'Invalid phone number format'
    }),
  email: z.string().email("Invalid email address"),
  referralCode: z.string().optional(),
});

// Schema for the Login form
const LoginSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or phone number"),
});

// Schema for OTP verification
const VerifySchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

type SignUpFormValues = z.infer<typeof SignUpSchema>;
type LoginFormValues = z.infer<typeof LoginSchema>;
type VerifyFormValues = z.infer<typeof VerifySchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [newUserData, setNewUserData] = useState<SignUpFormValues | null>(null);

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { firstName: "", lastName: "", age: undefined, phone: "", email: "", referralCode: "" },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: "" },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(VerifySchema),
    defaultValues: { code: "" },
  });

  const onSignUpSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setIsLoading(true);
    setNewUserData(data);
    setLoginIdentifier(data.phone);
    // Mock API call for sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep("verify");
    setIsLoading(false);
  };
  
  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setNewUserData(null); // Ensure we are in login mode
    setLoginIdentifier(data.identifier);
    // Mock API call for sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep("verify");
    setIsLoading(false);
  };

  const onVerifySubmit: SubmitHandler<VerifyFormValues> = async (data) => {
    setIsLoading(true);
    // Mock API call for verifying OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // On successful verification, login the user
    // This will fetch existing data or create a new user profile
    await login(loginIdentifier, newUserData || undefined);

    // Redirect to home
    router.push("/home");
  };
  
  if (step === "verify") {
    return (
        <div className="w-full rounded-lg border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-8">
            <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
                <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to {loginIdentifier}
                </p>
                </div>
                <FormField
                control={verifyForm.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                        <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full group" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
                </Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => { setStep('form'); setIsLoading(false); }}>
                    Back to form
                </Button>
            </form>
            </Form>
        </div>
    )
  }

  return (
    <div className="w-full rounded-lg border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-8">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-6">
            <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                control={loginForm.control}
                name="identifier"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email or Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="name@example.com or +91 1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full group" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <>
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
                </Button>
            </form>
            </Form>
        </TabsContent>
        <TabsContent value="signup" className="mt-6">
            <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={signUpForm.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={signUpForm.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
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
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={signUpForm.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="+91 1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={signUpForm.control}
                        name="age"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="25" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={signUpForm.control}
                        name="referralCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Referral Code <span className="text-muted-foreground">(Optional)</span></FormLabel>
                            <FormControl>
                                <Input placeholder="ZEP123" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <Button type="submit" className="w-full group" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <>
                    Sign Up & Get OTP
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
                </Button>
            </form>
            </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
