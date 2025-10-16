import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Link } from "react-router";

export default function EnterExamPage() {
  return (
    <Card className="w-[80%] sm:max-w-[80%] md:max-w-[50%] lg:max-w-[25%] mx-auto my-auto space-y-3">
      <CardHeader>
        <CardTitle>Enter Exam 6-Digit Code</CardTitle>
        <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
          <InputOTPGroup className="mx-auto">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP> */}
        <Input
          type="number"
          autoFocus
          aria-controls="disabled"
          className="mx-auto w-fit text-center"
        />
        <Link to={"/examattempt"}>
          <Button className="w-full">Submit</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
