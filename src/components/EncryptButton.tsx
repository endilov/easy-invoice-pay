import React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const EncryptButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "button relative text-white font-medium px-6 py-3 rounded-lg w-full",
        "bg-gradient-to-r from-[#0ce39a] via-[#69007f] to-[#fc0987]",
        "before:content-[''] before:absolute before:inset-[1px]",
        "before:bg-black before:rounded-[9px] before:transition-opacity before:duration-500",
        "after:content-[''] after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-[#0ce39a] after:via-[#69007f] after:to-[#fc0987]",
        "after:rounded-lg after:transition-opacity after:duration-500",
        "after:opacity-0 after:blur-xl hover:after:opacity-100",
        "hover:before:opacity-70",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        "group"
      )}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-lg">
          {isSubmitting ? "Processing..." : "Pay Now"}
        </span>
      </div>
    </button>
  );
};