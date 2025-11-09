//@ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContext } from "@/App";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ProfileImage from "@/components/profileupload";
import { error } from "console";
export default function ProfilePage() {
  const { user, setUser, localIp, protocol } = useContext(UserContext);
  const nameForm = useForm({
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });
  const emailForm = useForm({
    defaultValues: {
      email: user.email,
    },
  });
  const passwordForm = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      new_confirm_password: "",
    },
  });

  const profilePic = useRef(null);

  const nameUpdate = (data) => {
    const formData = new FormData();
    const uploadendpoint = `${protocol}://${localIp}:3000/api/upload/profile`;
    axios
      .post(uploadendpoint, formData, {
        headers: {
          ["x-auth-token"]: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        toast.success("Image Uploaded Successfully");
        setUser((prev) => ({
          ...prev,
          profile: res.data.filename,
        }));
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
          console.error(error.response.data.error);
        } else {
          console.log(error);
        }
      });

    const apiendpoint = `${protocol}://${localIp}:3000/api/profile/nameupdate`;
    axios
      .post(apiendpoint, {
        first_name: data.first_name,
        last_name: data.last_name,
        user_id: user.user_id,
      })
      .then((res) => {
        toast.success("Name updated successfully");
        setUser((prev) => ({
          ...prev,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
        }));
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data.error);
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("No response recieved");
          console.log(error.request);
        } else {
          toast.error("Request error");
          console.log(error.message);
        }
      });
  };

  const emailUpdate = (data) => {
    const apiendpoint = `${protocol}://${localIp}:3000/api/profile/emailupdate`;
    axios
      .post(apiendpoint, {
        email: data.email,
        user_id: user.user_id,
      })
      .then((res) => {
        toast.success(res.data.message);
        setUser((prev) => ({
          ...prev,
          email: res.data.email,
        }));
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data.error);
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("No response recieved");
          console.log(error.request);
        } else {
          toast.error("Request error");
          console.log(error.message);
        }
      });
  };

  const passwordSubmit = (data) => {
    const apiendpoint = `${protocol}://${localIp}:3000/api/profile/passwordupdate`;
    axios
      .post(apiendpoint, {
        old_password: data.old_password,
        new_password: data.new_password,
        new_confirm_password: data.new_confirm_password,
        user_id: user.user_id,
      })
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data.error);
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("No response recieved");
          console.log(error.request);
        } else {
          toast.error("Request error");
          console.log(error.message);
        }
      });
  };
  return (
    <>
      <div className="w-full mt-15 p-4 md:p-8">
        <Tabs
          defaultValue="account"
          className="flex-col gap-10 lg:flex-row w-full"
        >
          <TabsList className="lg:flex-col lg:items-start gap-3 mx-auto lg:mx-px lg:h-fit lg:p-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>
          <div className="w-full">
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col mx-auto md:flex-row">
                  <div className="flex justify-center">
                    <ProfileImage
                      initialPicUrl={`${protocol}://${localIp}:5173/images/upload/user/profile/${user.profile}`}
                      profilePic={profilePic}
                    />
                  </div>
                  <Form {...nameForm}>
                    <form onSubmit={nameForm.handleSubmit(nameUpdate)}>
                      <div className="p-5 md:w-[80%] md:ml-10 my-8 md:my-px">
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-1 gap-2 flex-col">
                            <FormField
                              rules={{
                                required: "First name is required",
                              }}
                              name="first_name"
                              control={nameForm.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input className="w-full" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex flex-1 gap-2 flex-col">
                            <FormField
                              rules={{
                                required: "Last name is required",
                              }}
                              control={nameForm.control}
                              name="last_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input className="w-full" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-10"></div>
                        <Button type="submit" className="ml-auto my-5">
                          Update
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Reprehenderit perspiciatis accusamus culpa quo, nobis quis
                    aliquid. Quas optio magnam sint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:w-[50%]">
                  <Form {...emailForm}>
                    <form
                      onSubmit={emailForm.handleSubmit(emailUpdate)}
                      className="flex flex-col gap-5"
                    >
                      <div className="gap-5 flex">
                        <FormField
                          rules={{
                            required: "Email name is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email",
                            },
                          }}
                          name="email"
                          control={emailForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input className="w-full" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-fit">
                        Update
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="authentication">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Architecto, dolorem corporis corrupti libero iusto numquam
                    nostrum reiciendis blanditiis facere cum provident,
                    laboriosam eos, id iste et. Iste mollitia aliquid cum.
                  </CardDescription>
                </CardHeader>
                <CardContent className="lg:w-[50%]">
                  <Form {...passwordForm}>
                    <form
                      className="gap-5 flex flex-col"
                      onSubmit={passwordForm.handleSubmit(passwordSubmit)}
                    >
                      <div className="flex gap-2 flex-col">
                        <FormField
                          rules={{
                            required: "Old password is required",
                            minLength: {
                              value: 8,
                              message:
                                "Password needs be atleast 8 digits long",
                            },
                          }}
                          name="old_password"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Old Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-2 flex-col">
                        <FormField
                          rules={{
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message:
                                "Password needs to be atleast 8 digits long",
                            },
                            validate: (value) =>
                              value != passwordForm.getValues("old_password") ||
                              "New password needs to be different",
                          }}
                          name="new_password"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-2 flex-col">
                        <FormField
                          rules={{
                            required: "Confirm new password is required",
                            validate: (value) =>
                              value ===
                                passwordForm.getValues("new_password") ||
                              "Passwords don't match",
                          }}
                          control={passwordForm.control}
                          name="new_confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <p>
                        Make sure it's at least 15 characters OR at least 8
                        characters including a number and a lowercase letter
                      </p>
                      <Button type="submit" className="w-fit">
                        Update
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
