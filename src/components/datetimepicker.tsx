//@ts-nocheck
"use client";
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DateTimePicker24h({ value, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate minimum date (1 hour from now)
  const getMinDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now;
  };

  const minDate = getMinDate();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // Preserve the current time when only date is selected
      if (value) {
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
      } else {
        // If no existing value, set to minimum time (current hour + 1)
        const minTime = new Date(minDate);
        newDate.setHours(minTime.getHours());
        newDate.setMinutes(minTime.getMinutes());
      }

      // Ensure the selected date is not before minDate
      if (newDate < minDate) {
        // If selected date is before minimum, set to minimum date
        onChange(new Date(minDate));
      } else {
        onChange(newDate);
      }
    }
  };

  const handleTimeChange = (type: "hour" | "minute", timeValue: string) => {
    const newDate = value ? new Date(value) : new Date(minDate);
    const selectedHour =
      type === "hour" ? parseInt(timeValue) : newDate.getHours();
    const selectedMinute =
      type === "minute" ? parseInt(timeValue) : newDate.getMinutes();

    newDate.setHours(selectedHour);
    newDate.setMinutes(selectedMinute);

    // Ensure the selected time is not before minDate
    if (newDate < minDate) {
      // If selected time is before minimum, set to minimum time
      onChange(new Date(minDate));
    } else {
      onChange(newDate);
    }
  };

  // Disable dates before today and today if current time + 1 hour is tomorrow
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Disable dates before today
    if (checkDate < today) {
      return true;
    }

    // If selecting today, check if we need to disable it based on current time
    if (checkDate.getTime() === today.getTime()) {
      const currentTime = new Date();
      currentTime.setHours(currentTime.getHours() + 1);
      return currentTime.getDate() !== today.getDate();
    }

    return false;
  };

  // Check if an hour should be disabled
  const isHourDisabled = (hour: number) => {
    if (!value) return false;

    const testDate = new Date(value);
    testDate.setHours(hour, value.getMinutes());

    return testDate < minDate;
  };

  // Check if a minute should be disabled
  const isMinuteDisabled = (minute: number) => {
    if (!value) return false;

    const testDate = new Date(value);
    testDate.setMinutes(minute);

    return testDate < minDate;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "MM/dd/yyyy HH:mm")
          ) : (
            <span>MM/DD/YYYY HH:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            disabled={isDateDisabled}
            fromDate={new Date()} // Only allow dates from today onwards
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      isHourDisabled(hour) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() =>
                      !isHourDisabled(hour) &&
                      handleTimeChange("hour", hour.toString())
                    }
                    disabled={isHourDisabled(hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className={cn(
                      "sm:w-full shrink-0 aspect-square",
                      isMinuteDisabled(minute) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() =>
                      !isMinuteDisabled(minute) &&
                      handleTimeChange("minute", minute.toString())
                    }
                    disabled={isMinuteDisabled(minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
