//@ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContext } from "@/App";
export default function ProfilePage() {
  const { user, setUser } = useContext(UserContext);
  const initalState = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    old_password: "",
    new_password: "",
    new_confirm_password: "",
  };
  const [userInfo, setUserInfo] = useState(initalState);
  const nameUpdate = (e) => {
    e.preventDefault();
    const apiendpoint = "http://localhost:3000/api/profile/nameupdate";
    axios
      .post(apiendpoint, {
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        user_id: user.user_id,
      })
      .then((res) => {
        toast.success(res.data.message);
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

  const emailUpdate = (e) => {
    e.preventDefault();
    const apiendpoint = "http://localhost:3000/api/profile/emailupdate";
    axios
      .post(apiendpoint, {
        email: userInfo.email,
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

  const passwordSubmit = (e) => {
    e.preventDefault();
    const apiendpoint = "http://localhost:3000/api/profile/passwordupdate";
    axios
      .post(apiendpoint, {
        old_password: userInfo.old_password,
        new_password: userInfo.new_password,
        new_confirm_password: userInfo.new_confirm_password,
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
        <Tabs defaultValue="account" className="flex-col gap-10 lg:flex-row w-full">
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
                    <Avatar className="size-50">
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/173893599?v=4"
                        alt="@shadcn"
                      />
                      <AvatarFallback className="text-2xl">CN</AvatarFallback>
                    </Avatar>
                  </div>
                  <form onSubmit={(e) => nameUpdate(e)}>
                    <div className="p-5 md:w-[80%] md:ml-10 my-8 md:my-px">
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-1 gap-2 flex-col">
                          <Label about="firstname">First Name</Label>
                          <Input
                            required
                            onChange={(e) =>
                              setUserInfo((prev) => ({ ...prev, first_name: e.target.value }))
                            }
                            value={userInfo.first_name}
                            name="first_name"
                            type="text"
                            className="w-full"
                          />
                        </div>
                        <div className="flex flex-1 gap-2 flex-col">
                          <Label about="lastname">Last Name</Label>
                          <Input
                            name="last_name"
                            type="text"
                            required
                            value={userInfo.last_name}
                            onChange={(e) =>
                              setUserInfo((prev) => ({ ...prev, last_name: e.target.value }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-10"></div>
                      <Button type="submit" className="ml-auto my-5">
                        Update
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit
                    perspiciatis accusamus culpa quo, nobis quis aliquid. Quas optio magnam sint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:w-[50%]">
                  <form onSubmit={(e) => emailUpdate(e)} className="flex flex-col gap-5">
                    <div className="gap-5 flex">
                      <Label about="email">Email</Label>
                      <Input
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        name="email"
                        type="email"
                      />
                    </div>
                    <Button type="submit" className="w-fit">
                      Update
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="authentication">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Architecto, dolorem
                    corporis corrupti libero iusto numquam nostrum reiciendis blanditiis facere cum
                    provident, laboriosam eos, id iste et. Iste mollitia aliquid cum.
                  </CardDescription>
                </CardHeader>
                <CardContent className="lg:w-[50%]">
                  <form className="gap-5 flex flex-col" onSubmit={(e) => passwordSubmit(e)}>
                    <div className="flex gap-2 flex-col">
                      <Label about="old_password">Old Password</Label>
                      <Input
                        value={userInfo.old_password}
                        onChange={(e) =>
                          setUserInfo((prev) => ({ ...prev, old_password: e.target.value }))
                        }
                        name="old_password"
                        type="password"
                      />
                    </div>
                    <div className="flex gap-2 flex-col">
                      <Label about="new_password">New Password</Label>
                      <Input
                        value={userInfo.new_password}
                        onChange={(e) =>
                          setUserInfo((prev) => ({ ...prev, new_password: e.target.value }))
                        }
                        name="new_password"
                        type="password"
                      />
                    </div>
                    <div className="flex gap-2 flex-col">
                      <Label about="new_confirm_password">Confirm New Password</Label>
                      <Input
                        value={userInfo.new_confirm_password}
                        onChange={(e) =>
                          setUserInfo((prev) => ({ ...prev, new_confirm_password: e.target.value }))
                        }
                        name="new_confirm_password"
                        type="password"
                      />
                    </div>
                    <p>
                      Make sure it's at least 15 characters OR at least 8 characters including a
                      number and a lowercase letter
                    </p>
                    <Button type="submit" className="w-fit">
                      Update
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
