import { PaymentForm } from "@/components/PaymentForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Invoice Payment</h1>
          <p className="text-lg text-gray-600">
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