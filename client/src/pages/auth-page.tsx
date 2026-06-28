import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Images } from "@/config/images";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Github, Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

const inputClassName =
  "h-12 rounded-xl border-zinc-200 bg-white px-4 text-base shadow-sm shadow-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-950";

const labelClassName = "text-base font-semibold text-zinc-950";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    setLocation(getPostLoginHref(user.role));
    return null;
  }

  const isLogin = activeTab === "login";

  return (
    <main className="h-dvh overflow-hidden bg-white text-zinc-950 lg:grid lg:grid-cols-2">
      <section className="flex h-dvh items-center justify-center overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[440px]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-8">
              <img src={Images.logo} className="mb-4 w-40" alt="" />
              <h1 className="text-xl font-bold tracking-normal sm:text-3xl">
                {isLogin ? "Login to your account" : "Create your account"}
              </h1>
              <p className="mt-2 text-base text-zinc-500">
                {isLogin
                  ? "Enter your details below to login to your account"
                  : "Enter your details below to create your account"}
              </p>
            </div>

            <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-xl bg-zinc-100 p-1">
              <TabsTrigger
                value="login"
                className="h-10 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="h-10 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm onSignUpClick={() => setActiveTab("register")} />
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <RegisterForm onLoginClick={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="hidden h-dvh bg-zinc-100 lg:block">
        <img
          src={Images.loginUtils}
          alt="Event crowd"
          className="h-full w-full object-cover"
        />
      </section>
    </main>
  );
}

function LoginForm({ onSignUpClick }: { onSignUpClick: () => void }) {
  const { loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const form = useForm({
    resolver: zodResolver(
      insertUserSchema.pick({ username: true, password: true }),
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          loginMutation.mutate(data, {
            onSuccess: (user) => setLocation(getPostLoginHref(user.role)),
          }),
        )}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClassName}>
                Email or username
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  inputMode="email"
                  placeholder="m@example.com"
                  className={inputClassName}
                  {...field}
                />
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
              <div className="flex items-center justify-between gap-4">
                <FormLabel className={labelClassName}>Password</FormLabel>
                <button
                  type="button"
                  className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-black text-base font-semibold text-white hover:bg-zinc-800"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Login
        </Button>
      </form>
    </Form>
  );
}

function getPostLoginHref(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "vendor") return "/vendor";
  if (role === "organizer") return "/organizer";

  return "/";
}

function RegisterForm({ onLoginClick }: { onLoginClick: () => void }) {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema.omit({ role: true })),
    defaultValues: {
      email: "",
      phoneNumber: "",
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleEmailChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    form.setValue("email", value, { shouldValidate: true });
    form.setValue("username", value.split("@")[0], { shouldValidate: true });

    if (emailCheckTimeout.current) {
      clearTimeout(emailCheckTimeout.current);
    }

    const isValidEmail = /\S+@\S+\.\S+/.test(value);
    if (!isValidEmail) {
      form.setError("email", {
        type: "manual",
        message: "This email is invalid",
      });
      return;
    }

    emailCheckTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/check-email?email=${encodeURIComponent(value)}`,
          {
            method: "GET",
          },
        );

        const data = await response.json();

        if (data.exists) {
          form.setError("email", {
            type: "manual",
            message: "This email is already registered",
          });
        } else {
          form.clearErrors("email");
          form.trigger();
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
    }, 500);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          registerMutation.mutate({ ...data, role: "customer" }),
        )}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    className={inputClassName}
                    {...field}
                    onChange={handleEmailChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClassName}>Phone</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="tel"
                    placeholder="Phone number"
                    className={inputClassName}
                    {...field}
                  />
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
              <FormLabel className={labelClassName}>Username</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="Username"
                  className={inputClassName}
                  {...field}
                />
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
              <FormLabel className={labelClassName}>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Password"
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-black text-base font-semibold text-white hover:bg-zinc-800"
          disabled={registerMutation.isPending || !form.formState.isValid}
        >
          {registerMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign up
        </Button>
      </form>
    </Form>
  );
}
