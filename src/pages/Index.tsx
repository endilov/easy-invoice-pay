import { PaymentForm } from "@/components/PaymentForm";
import AdminPanel from "@/components/AdminPanel";
import { useParams } from "react-router-dom";

export default function Index() {
  const { id, description } = useParams();
  const amount = id ? parseFloat(id) : 100;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black animate-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
        </div>
      </div>
      <AdminPanel />
      <PaymentForm amount={amount} />
    </div>
  );
}