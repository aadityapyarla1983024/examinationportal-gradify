import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ElegantShape } from "@/components/ui/shadcn-io/shape-landing-hero";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const form = useForm({
    defaultValues: {
      new_password: "",
      confirm_new_password: "",
    },
  });

  const navigate = useNavigate();

  const { jwt } = useParams();
  const onSubmit = (data) => {
    const apiendpoint = "http://localhost:3000/api/auth/reset-password";
    axios
      .post(
        apiendpoint,
        { new_password: data.new_password },
        {
          headers: {
            "x-auth-token": jwt,
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        setTimeout(() => navigate("/signin"), 2000);
      })
      .catch((err) => {
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
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Provide us your new password so that you can log into your account once again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="new_password"
                    rules={{
                      required: "New password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm_new_password"
                    rules={{
                      required: "Confirm new password is required",
                      validate: (value) =>
                        value === form.getValues("new_password") || "Passwords do not match",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="mx-auto block w-full">
                    Reset Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
