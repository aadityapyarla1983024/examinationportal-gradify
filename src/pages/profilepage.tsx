import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function ProfilePage() {
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
                  <Avatar className="size-50">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback className="text-2xl">CN</AvatarFallback>
                  </Avatar>

                  <div className="p-5 w-[50%] md:ml-10 my-8 md:my-px">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-1 gap-2 flex-col">
                        <Label about="firstname">First Name</Label>
                        <Input name="firstname" type="text" />
                      </div>
                      <div className="flex flex-1 gap-2 flex-col">
                        <Label about="lastname">Last Name</Label>
                        <Input name="lastname" type="text" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-10"></div>
                    <Button className="ml-auto my-5">Update</Button>
                  </div>
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
                <CardContent className="md:w-[50%] flex flex-col gap-5">
                  <div className="gap-5 flex">
                    <Label about="email">Email</Label>
                    <Input name="email" type="email" />
                  </div>
                  <Button className="w-fit">Update</Button>
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
                <CardContent className="flex flex-col gap-5 lg:w-[50%]">
                  <div className="flex gap-2 flex-col">
                    <Label about="old_password">Old Password</Label>
                    <Input name="old_password" type="password" />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <Label about="password">New Password</Label>
                    <Input name="password" type="password" />
                  </div>
                  <div className="flex gap-2 flex-col">
                    <Label about="confirm_password">Confirm New Password</Label>
                    <Input name="confirm_password" type="password" />
                  </div>
                  <p>
                    Make sure it's at least 15 characters OR at least 8 characters including a
                    number and a lowercase letter
                  </p>
                  <Button className="w-fit">Update</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
