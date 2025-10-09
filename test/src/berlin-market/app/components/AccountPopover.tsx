"use client";

import * as React from "react";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import AccountPopoverContent from "./AccountPopoverContent";

export default function AccountPopover() {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        closeRef.current?.click();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <Popover onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="group flex flex-col items-center justify-center cursor-pointer bg-transparent border-none p-0 outline-none">
          <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
            <User className="h-full w-full" />
          </div>
          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Cuenta</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-none shadow-xl z-[9999] w-auto" align="center" sideOffset={8}>
        <AccountPopoverContent />
      </PopoverContent>
      <PopoverClose ref={closeRef} className="hidden" />
    </Popover>
  );
}