"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CardSpotlight = ({ title, content, footer, description, className }) => {
  useEffect(() => {
    const all = document.querySelectorAll(".spotlight-card");
    const handleMouseMove = (ev) => {
      all.forEach((e) => {
        const blob = e.querySelector(".blob");
        const fblob = e.querySelector(".fake-blob");
        if (!blob || !fblob) return;
        const rec = fblob.getBoundingClientRect();
        blob.style.opacity = "1";
        blob.animate(
          [
            {
              transform: `translate(${
                ev.clientX - rec.left - rec.width / 2
              }px, ${ev.clientY - rec.top - rec.height / 2}px)`,
            },
          ],
          { duration: 300, fill: "forwards" }
        );
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={cn(
        "spotlight-card relative overflow-hidden rounded-xl p-[1px] bg-border transition-all duration-300 ease-in-out",
        className
      )}
    >
      <Card className="h-full flex flex-col justify-between border-none bg-background/90 transition-all duration-300 ease-in-out hover:backdrop-blur-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">{content}</CardContent>
        <CardFooter>{footer}</CardFooter>
      </Card>
      <div className="blob absolute top-0 left-0 h-20 w-20 rounded-full bg-black/35 opacity-0 blur-2xl transition-all duration-300 ease-in-out dark:bg-sky-400/60" />
      <div className="fake-blob absolute top-0 left-0 h-20 w-20 rounded-full" />
    </div>
  );
};

export default CardSpotlight;
