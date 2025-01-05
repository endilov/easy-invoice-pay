import { PaymentForm } from "@/components/PaymentForm";
import AdminPanel from "@/components/AdminPanel";
import { useParams } from "react-router-dom";
import { CreditCard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Index() {
  const { id, description } = useParams();
  const amount = id ? parseFloat(id) : 100;
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Set initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 animated-bg">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
        </div>
      </div>

      {/* Theme Toggle Button */}
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
          <h2 className="text-white text-xl mb-4 font-bold animate-fadeIn">
            Payment for: {decodeURIComponent(description)}
          </h2>
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