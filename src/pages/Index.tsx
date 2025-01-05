import { PaymentForm } from "@/components/PaymentForm";

const Index = () => {
  return (
    <div className="min-h-screen animated-bg py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-4">Invoice Payment</h1>
          <p className="text-lg text-gray-400">
            Complete your payment securely
          </p>
        </div>
        
        <PaymentForm 
          amount={99.99}
          currency="USD"
          onPaymentComplete={() => {
            console.log("Payment completed successfully");
          }}
        />
      </div>
    </div>
  );
};

export default Index;