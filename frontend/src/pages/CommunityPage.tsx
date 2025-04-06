
import DashboardLayout from "@/components/DashboardLayout";
import { CommunityChat } from "@/components/CommunityChat";

const CommunityPage = () => {
  return (
    <DashboardLayout pageTitle="Community Support">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-wellness-green-dark mb-2">Support Community</h2>
          <p className="text-gray-600">
            Connect with others on similar wellness journeys. Share experiences, 
            support each other, and learn coping strategies in a safe environment.
          </p>
        </div>
        
        <CommunityChat />
      </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
