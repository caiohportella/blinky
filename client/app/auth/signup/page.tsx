"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreValue } from "@simplestack/store/react";
import { signup, verify2FA, isAuthenticatedStore } from "@/lib/auth-store";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(2, "Firstname must be at least 2 characters"),
  lastName: z.string().min(2, "Lastname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const isAuthenticated = useStoreValue(isAuthenticatedStore);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true);
    setError(null);

    const fullName = `${values.firstName} ${values.lastName}`;
    const result = await signup(values.email, values.password, fullName).catch((err) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error("Sign up failed", {
        description: errorMessage,
      });
      return null;
    });

    setIsLoading(false);

    if (result?.requires2FA) {
      setEmail(values.email);
      setShow2FA(true);
      toast.success("Account created!", {
        description: "Check your email for the verification code.",
      });
      return;
    }

    if (result && !result.requires2FA) {
      toast.success("Success!", {
        description: "Your account has been created successfully.",
      });
      router.push("/dashboard");
    }
  }

  async function handleVerify2FA() {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verify2FA(email, otp);
      toast.success("Welcome to Blinky!", {
        description: "Your account has been verified.",
      });
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid verification code";
      setError(errorMessage);
      toast.error("Verification failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (show2FA) {
    return (
      <section className="flex min-h-screen bg-background px-4 py-16 md:py-32 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="bg-card m-auto h-fit w-full max-w-md rounded-3xl border-2 p-0.5 shadow-xl relative z-10">
          <div className="p-8 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mb-1 text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                {"We've sent a verification code to"}
              </p>
              <p className="mt-1 font-medium text-foreground">{email}</p>
            </div>

            <hr className="my-6 border-dashed" />

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code
                </p>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value: string) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify2FA}
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify & Complete Signup"}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShow2FA(false);
                  setOtp("");
                  setError(null);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to signup
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen bg-background px-4 py-16 md:py-32 relative overflow-hidden">
       {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="bg-card m-auto h-fit w-full max-w-md rounded-3xl border-2 p-0.5 shadow-xl relative z-10">
        <div className="p-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mb-1 mt-4 text-2xl font-bold">
              Create a Blinky Account
            </h1>
            <p className="text-sm text-muted-foreground">Welcome! Create an account to get started</p>
          </div>

          <hr className="my-4 border-dashed" />

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email</FormLabel>
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
                  <FormItem className="space-y-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Continue"}
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-sm">
              Have an account?
              <Button asChild variant="link" className="ml-3 px-2">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </p>
          </Form>
        </div>
      </div>
    </section>
  );
}
