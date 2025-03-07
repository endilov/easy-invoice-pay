import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  amount: number;
  description: string;
  website?: string;
  company?: string;
  refundPolicy?: string;
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [company, setCompany] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
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
      website: website,
      company: company,
      refundPolicy: refundPolicy,
    };
    
    // Create URL with query parameters
    const baseUrl = window.location.origin;
    const queryParams = new URLSearchParams({
      amount: invoiceAmount.toString(),
      description: description,
      ...(website && { website: website }),
      ...(company && { company: company }),
      ...(refundPolicy && { refundPolicy: refundPolicy }),
    });
    const invoiceUrl = `${baseUrl}?${queryParams.toString()}`;
    
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
    setWebsite("");
    setCompany("");
    setRefundPolicy("");
  };

  return (
    <div className="min-h-screen bg-black/95 p-8">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">
            {!isAuthenticated
              ? "Enter admin password to continue"
              : "Create new invoices"}
          </p>
        </div>

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
            <div className="space-y-2">
              <Label className="text-white">Company (optional)</Label>
              <Input
                placeholder="Enter company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Website (optional)</Label>
              <Input
                type="url"
                placeholder="Enter website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Refund Policy (optional)</Label>
              <Textarea
                placeholder="Enter refund policy"
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="bg-black/50 border-white/20 text-white min-h-[100px] resize-y"
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
    </div>
  );
};

export default AdminPanel;