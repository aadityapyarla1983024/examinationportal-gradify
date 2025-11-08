"use client";

import * as React from "react";
import { useId, useState } from "react";
import { LayoutGridIcon, PlusIcon, SearchIcon } from "lucide-react";
import InfoMenu from "./InfoMenu";
import NotificationMenu from "./NotificationMenu";
import SettingsMenu from "./SettingsMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectLabel,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

// Types
export interface Navbar14Props extends React.HTMLAttributes<HTMLElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  testMode?: boolean;
  showTestMode?: boolean;
  filterBy?: string;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    unread?: boolean;
  }>;
  onSearchChange?: (value: string) => void;
  setFilterBy?: (value: string) => void;
  onTestModeChange?: (enabled: boolean) => void;
  onLayoutClick?: () => void;
  onAddClick?: () => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationClick?: (notificationId: string) => void;
  onSettingsItemClick?: (item: string) => void;
}

export const Navbar14 = React.forwardRef<HTMLElement, Navbar14Props>(
  (
    {
      className,
      filterBy,
      setFilterBy,
      searchPlaceholder = "Search...",
      searchValue,
      testMode: controlledTestMode,
      showTestMode = true,
      notifications,
      onSearchChange,
      onTestModeChange,
      onLayoutClick,
      onAddClick,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [internalTestMode, setInternalTestMode] = useState<boolean>(true);

    // Use controlled or internal test mode state
    const testModeValue =
      controlledTestMode !== undefined ? controlledTestMode : internalTestMode;

    const handleTestModeChange = (checked: boolean) => {
      if (controlledTestMode === undefined) {
        setInternalTestMode(checked);
      }
      if (onTestModeChange) {
        onTestModeChange(checked);
      }
    };

    return (
      <header
        ref={ref}
        className={cn("border-b px-4 md:px-6 [&_*]:no-underline", className)}
        {...props}
      >
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="relative">
            <Input
              id={`input-${id}`}
              className="peer h-8 w-full max-w-s ps-8 pe-2"
              placeholder={searchPlaceholder}
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
              <SearchIcon size={16} />
            </div>
          </div>

          <div className="flex-1 items-center hidden md:block gap-4">
            <Select
              onValueChange={(value) => setFilterBy(value)}
              value={filterBy}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter By</SelectLabel>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="field">Field</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <Button
              className="size-10 rounded-full"
              size="icon"
              aria-label="Add new item"
              onClick={(e) => {
                e.preventDefault();
                if (onAddClick) onAddClick();
              }}
            >
              <PlusIcon size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="block md:hidden mb-5 w-full">
          <Select
            onValueChange={(value) => setFilterBy(value)}
            value={filterBy} 
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter By field" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select a Field</SelectLabel>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="field">Field</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>
    );
  }
);

Navbar14.displayName = "Navbar14";

export { InfoMenu, NotificationMenu, SettingsMenu };
