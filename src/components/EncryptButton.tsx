import React from "react";
import { Lock } from "lucide-react";
import { StyledButton } from "./StyledButton";

export const EncryptButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <StyledButton
      type="submit"
      disabled={isSubmitting}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-lg">
          {isSubmitting ? "Processing..." : "Pay Now"}
        </span>
      </div>
    </StyledButton>
  );
};