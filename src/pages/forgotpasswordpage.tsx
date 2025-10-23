import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ElegantShape } from "@/components/ui/shadcn-io/shape-landing-hero";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
export default function ForgotPasswordPage() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });
  const navigate = useNavigate();
  const [emailLoading, setEmailLoading] = useState(false);

  const onSubmit = (data) => {
    setEmailLoading(true);
    const apiendpoint = "http://localhost:3000/api/auth/forgot-password";
    axios
      .post(apiendpoint, data)
      .then((res) => {
        setEmailLoading(false);
        toast.success("We have sent a password reset link to your email");
        setTimeout(() => {
          navigate("/signin");
        }, 5000);
      })
      .catch((err) => {
        setEmailLoading(false);
        if (err.response) {
          console.error(err.response.data.error);
          toast.error(err.response.data.message);
        } else if (err.request) {
          toast.error("No response recieved");
          console.error(err.request);
        } else {
          toast.error("Request error");
          console.error("Error", err.message);
        }
      });
  };
  return (
    <>
      <div className="min-h-[93vh] relative w-full flex items-center justify-center overflow-hidden bg-[#030303] space-x-50">
        <div className="absolute w-full inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

        <div className="absolute w-full inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-indigo-500/[0.15]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />

          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-rose-500/[0.15]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            gradient="from-violet-500/[0.15]"
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          />

          <ElegantShape
            delay={0.6}
            width={200}
            height={60}
            rotate={20}
            gradient="from-amber-500/[0.15]"
            className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          />

          <ElegantShape
            delay={0.7}
            width={150}
            height={40}
            rotate={-25}
            gradient="from-cyan-500/[0.15]"
            className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          />
        </div>
        <div className="container z-10 px-9 py-15 md:max-w-[30%]">
          {/* <h1 className="font-bold text-3xl text-grey-800 mb-7 w-full">Sign In</h1> */}
          <Card>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Provide us your email and we'll share the password reset link to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!emailLoading && (
                    <Button type="submit" className="mx-auto block w-full mt-10">
                      Reset Password
                    </Button>
                  )}
                  {emailLoading && (
                    <Button disabled type="submit" className="mx-auto block w-full mt-10">
                      <Spinner className="inline-block mr-2" />
                      Sending you an email
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
