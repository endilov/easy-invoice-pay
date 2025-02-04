import { PaymentForm } from "@/components/PaymentForm";
import { CreditCard, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Index() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : 100;
  const description = searchParams.get('description');
  const website = searchParams.get('website');
  const refundPolicy = searchParams.get('refundPolicy');

  // Redirect if no parameters are present
  useEffect(() => {
    const hasAnyParams = Array.from(searchParams.entries()).length > 0;
    if (!hasAnyParams) {
      console.log("No parameters detected, redirecting to Revolut...");
      window.location.href = "https://www.revolut.com/business/revolut-pay/";
    }
  }, [searchParams]);

  console.log("Current amount:", amount);
  console.log("Current description:", description);
  console.log("Current website:", website);
  console.log("Current refund policy:", refundPolicy);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden animated-bg">
      <div className="flex flex-col items-center space-y-4 z-10 w-full max-w-md px-4">
        {description && (
          <div className="w-full bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-xl animate-fadeIn">
            <h2 className="text-white/90 text-xl font-medium mb-2">Payment Details</h2>
            <p className="text-white/70 text-base leading-relaxed break-words font-light">
              {decodeURIComponent(description)}
            </p>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm group"
              >
                <Globe className="w-4 h-4" />
                <span className="underline underline-offset-4 group-hover:underline-offset-2 transition-all">
                  {website.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Amount Due</span>
                <span className="text-white font-medium text-lg">${amount.toFixed(2)}</span>
              </div>
            </div>
            {refundPolicy && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4 w-full bg-black/30 border-white/20 text-white hover:bg-white/10 transition-all duration-300 group"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                    Refund Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/95 border-white/20 text-white max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Refund Policy
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 text-white/80 leading-relaxed whitespace-pre-wrap">
                    {refundPolicy}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
        
        <PaymentForm amount={amount} />
        
        <div className="flex flex-col items-center space-y-3 mt-8 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-white/60" />
            <p className="text-white/60 text-sm">
              Secure payment with SSL encryption
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <p className="text-white/80 text-sm font-medium">
              We accept:
            </p>
            <div className="flex space-x-4">
              <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg flex items-center space-x-2">
                <img 
                  src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" 
                  alt="Visa" 
                  className="h-6 object-contain"
                />
                <span className="text-white/80 text-sm font-medium">Visa</span>
              </div>
              <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-lg flex items-center space-x-2">
                <img 
                  src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png" 
                  alt="Mastercard" 
                  className="h-6 object-contain"
                />
                <span className="text-white/80 text-sm font-medium">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}