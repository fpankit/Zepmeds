
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

const OTPSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

const VerifySchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
  phone: z.string(),
});

type OTPFormValues = z.infer<typeof OTPSchema>;
type VerifyFormValues = z.infer<typeof VerifySchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<"otp" | "verify">("otp");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { phone: "" },
  });

  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(VerifySchema),
    defaultValues: { code: "", phone: "" },
  });

  const onOtpSubmit: SubmitHandler<OTPFormValues> = async (data) => {
    setIsLoading(true);
    setPhoneNumber(data.phone);
    // Mock API call for sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    verifyForm.setValue("phone", data.phone);
    setStep("verify");
    setIsLoading(false);
  };

  const onVerifySubmit: SubmitHandler<VerifyFormValues> = async (data) => {
    setIsLoading(true);
    // Mock API call for verifying OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // On successful verification, login the user
    // This will fetch existing data or create a new user profile in Firestore
    await login(data.phone);

    // Redirect to home
    router.push("/home");
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card/50 p-6 shadow-lg backdrop-blur-md sm:p-8">
      {step === "otp" ? (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            <FormField
              control={otpForm.control}
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
      ) : (
        <Form {...verifyForm}>
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to {phoneNumber}
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
                  Verify & Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
             <Button variant="link" size="sm" className="w-full" onClick={() => setStep('otp')}>
                Back to phone number entry
             </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
