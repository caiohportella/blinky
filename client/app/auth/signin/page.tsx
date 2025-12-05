"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreValue } from "@simplestack/store/react";
import { signin, isAuthenticatedStore } from "@/lib/auth-store";
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
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const signinSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
      await signin(values.email, values.password);
      toast.success("Success!", {
        description: "You have successfully signed in.",
      });
      router.push("/dashboard");
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
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
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
        </div>
      </div>
    </section>
  );
}
