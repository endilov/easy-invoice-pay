import React from "react";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const EncryptButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "w-full relative bg-black/50 border border-white/20 text-white hover:bg-white/10 transition-all duration-300",
        "before:absolute before:inset-0 before:border before:border-white/20 before:scale-x-[1.01] before:scale-y-[1.1]",
        "before:animate-[border-pulse_4s_ease-in-out_infinite]",
        "hover:before:border-white/40 hover:before:scale-x-[1.02] hover:before:scale-y-[1.15]",
        "group overflow-hidden"
      )}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="font-medium">Pay Now</span>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Button>
  );
};