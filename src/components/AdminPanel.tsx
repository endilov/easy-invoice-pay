import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

interface Invoice {
  amount: number;
  description: string;
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const ADMIN_PASSWORD = "cbpandqoial2025";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Successfully logged in to admin panel",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvoice = () => {
    const invoiceAmount = parseFloat(amount);
    if (isNaN(invoiceAmount) || invoiceAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const invoice: Invoice = {
      amount: invoiceAmount,
      description: description,
    };
    
    // Create URL-safe description
    const safeDescription = description.replace(/\s+/g, '-');
    const invoiceUrl = `https://traveltpay.com/checkout/${invoiceAmount}/${safeDescription}`;
    
    console.log("Created invoice:", invoice);
    console.log("Invoice URL:", invoiceUrl);
    
    toast({
      title: "Invoice Created",
      description: (
        <div className="space-y-2">
          <p>Invoice for ${amount} has been created</p>
          <a 
            href={invoiceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-blue-400 hover:text-blue-300 break-all underline"
          >
            {invoiceUrl}
          </a>
        </div>
      ),
    });
    
    // Reset form
    setAmount("");
    setDescription("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed top-4 right-4 bg-black/20 text-white border-white/20 hover:bg-black/40">
          Admin Panel
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-black/95 border-white/20">
        <SheetHeader>
          <SheetTitle className="text-white">Admin Panel</SheetTitle>
          <SheetDescription className="text-gray-400">
            {!isAuthenticated
              ? "Enter admin password to continue"
              : "Create new invoices"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <Button 
                onClick={handleLogin}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Amount ($)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Input
                  placeholder="Enter invoice description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>
              <Button 
                onClick={handleCreateInvoice}
                className="w-full bg-white text-black hover:bg-white/90"
                disabled={!amount || !description}
              >
                Create Invoice
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminPanel;
