import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { ChangeEvent, useRef } from "react";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-7xl bg-[#FAFAFA]">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl">Sign Up and Grab</CardTitle>
            <p className="text-sm text-gray-500 ">
            Discover your favorite entertainment right here
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
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

function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema.omit({ role: true }))
  });

const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  
const handleEmailChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  form.setValue('email', value); // optionally update the form immediately

  // Set the username immediately
  const username = value.split('@')[0];
  form.setValue('username', username);

  // Clear any previously scheduled check
  if (emailCheckTimeout.current) {
    clearTimeout(emailCheckTimeout.current);
  }

  // Validate email format before sending request (optional but good practice)
  const isValidEmail = /\S+@\S+\.\S+/.test(value);
  if (!isValidEmail) {
    form.setError('email', {
      type: 'manual',
      message: 'This email is invalid',
    });
    return;
  }

  // Set up debounce: delay API call by 500ms
  emailCheckTimeout.current = setTimeout(async () => {
    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.exists) {
        form.setError('email', {
          type: 'manual',
          message: 'This email is already registered',
        });
      } else {
        form.clearErrors('email');
        // Enable submit button
        form.trigger();
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  }, 500); // 500ms debounce delay
}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => registerMutation.mutate({ ...data, role: "customer" }))}
        className="space-y-4"
      >
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Middle Name" {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}
        
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                  type="email" placeholder="Email" {...field} 
                  onChange={(e) => handleEmailChange(e)}
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
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* <FormField
          control={form.control}
          name="birthDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth day</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
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
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full bg-[#00C4B4] hover:bg-[#00b4a4] text-white rounded-full"
          disabled={registerMutation.isPending || !form.formState.isValid}
        >
          {registerMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign Up
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm">Or</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
