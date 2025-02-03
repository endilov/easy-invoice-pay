import { PaymentForm } from "@/components/PaymentForm";
import AdminPanel from "@/components/AdminPanel";
import { CreditCard, Moon, Sun, Globe, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Index() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : 100;
  const description = searchParams.get('description');
  const website = searchParams.get('website');
  const refundPolicy = searchParams.get('refundPolicy');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  console.log("Current amount:", amount);
  console.log("Current description:", description);
  console.log("Current website:", website);
  console.log("Current refund policy:", refundPolicy);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-black/20 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-900" />
        )}
      </Button>
      
      <AdminPanel />
      
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
                <DialogContent className="bg-black/95 border-white/20 text-white">
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