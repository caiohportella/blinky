"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreValue } from "@simplestack/store/react";
import { signin, verify2FA, isAuthenticatedStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { AlertCircle, ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isAuthenticated = useStoreValue(isAuthenticatedStore);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SigninFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signin(values.email, values.password);
      
      if (result.requires2FA) {
        setEmail(values.email);
        setStep("2fa");
        toast.success("Verification code sent!", {
          description: "Check your email for the 6-digit code.",
        });
      } else {
        toast.success("Success!", {
          description: "You have successfully signed in.",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error("Sign in failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtpCode(newOtp);
      // Focus on the next empty input or last input
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otpCode];
      newOtp[index] = value.replace(/\D/g, "");
      setOtpCode(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verify2FA(email, code);
      toast.success("Success!", {
        description: "You have successfully signed in.",
      });
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Invalid verification code. Please try again.";
      setError(errorMessage);
      toast.error("Verification failed", {
        description: errorMessage,
      });
      // Clear OTP inputs on error
      setOtpCode(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("credentials");
    setError(null);
    setOtpCode(["", "", "", "", "", ""]);
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (step === "2fa" && otpCode.every(digit => digit !== "")) {
      handleVerify2FA();
    }
  }, [otpCode, step]);

  return (
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="bg-card m-auto h-fit w-full max-w-md rounded-3xl border-2 p-0.5 shadow-xl relative z-10">
        <div className="p-8 pb-6">
          {step === "credentials" ? (
            <>
              <div className="flex flex-col items-center text-center">
                <Logo />
                <h1 className="mb-1 mt-4 text-2xl font-bold">
                  Sign In to Blinky
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back! Sign in to continue</p>
              </div>

              <hr className="my-4 border-dashed" />

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="block text-sm">Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm">Password</FormLabel>
                          <Button asChild variant="link" size="sm">
                            <Link href="#" className="text-sm">
                              Forgot your Password?
                            </Link>
                          </Button>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <p className="text-muted-foreground text-center text-sm">
                  Don&apos;t have an account?
                  <Button asChild variant="link" className="ml-3 px-2">
                    <Link href="/auth/signup">Create account</Link>
                  </Button>
                </p>
              </Form>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="mb-1 text-2xl font-bold">
                  Two-Factor Authentication
                </h1>
                <p className="text-sm text-muted-foreground">
                  We sent a verification code to
                </p>
                <p className="text-sm font-medium flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {email}
                </p>
              </div>

              <hr className="my-4 border-dashed" />

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-center">
                    Enter verification code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otpCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerify2FA}
                  disabled={isLoading || otpCode.some(d => d === "")}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
