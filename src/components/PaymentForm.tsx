import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onPaymentComplete?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = "USD",
  onPaymentComplete,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + " / " + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/verify-3ds", { 
        state: { amount, currency }
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <Card className="p-6 space-y-6 shadow-xl bg-black/40 backdrop-blur-sm border-gray-800">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-center text-white">Payment Details</h2>
          <p className="text-center text-gray-400">
            Amount: {currency} {amount}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Card Number</label>
            <Input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="bg-black/20 border-gray-800 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Expiry Date</label>
              <Input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                maxLength={7}
                className="bg-black/20 border-gray-800 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">CVV</label>
              <Input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                placeholder="123"
                maxLength={4}
                className="bg-black/20 border-gray-800 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full bg-white hover:bg-gray-100 text-black",
              "transition-all duration-200 transform hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              "Pay Now"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Your payment is secure and encrypted</p>
        </div>
      </Card>
    </motion.div>
  );
};