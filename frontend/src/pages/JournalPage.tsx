
import DashboardLayout from "@/components/DashboardLayout";
import { JournalEntry } from "@/components/JournalEntry";
import { JournalList } from "@/components/JournalList";

const JournalPage = () => {
  return (
    <DashboardLayout pageTitle="Journal">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-wellness-green-dark mb-2">Mental Wellness Journal</h2>
          <p className="text-gray-600">
            Write down your thoughts, feelings, and experiences. 
            Journaling helps process emotions and track your mental health journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <JournalEntry />
          <JournalList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JournalPage;
