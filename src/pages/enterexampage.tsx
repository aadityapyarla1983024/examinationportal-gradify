import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

export default function EnterExamPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
    if(code === "") {
      return toast.error("Enter an exam code to continue");
    } 
    navigate(`/examattempt/${code}`)
  }
  return (
    <Card className=" mx-auto my-auto space-y-3">
      <CardHeader>
        <CardTitle>Enter Exam 6-Digit Code</CardTitle>
        <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <InputOTP minLength={12} value={code} onChange={(value) => setCode(value)} maxLength={12} pattern={REGEXP_ONLY_DIGITS}>
          <InputOTPGroup className="mx-auto">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
            <InputOTPSlot index={8} />
            <InputOTPSlot index={9} />
            <InputOTPSlot index={10} />
            <InputOTPSlot index={11} />
          </InputOTPGroup>
        </InputOTP>
        {/* <Input
          type="number"
          onChange={(e) => setCode(e.target.value)}
          value={code}
          autoFocus
          aria-controls="disabled"
          className="mx-auto w-fit text-center"
        /> */}
          <Button className="w-full" onClick={handleSubmit}>Submit</Button>
      </CardContent>
    </Card>
  );
}
