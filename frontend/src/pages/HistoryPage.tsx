
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { MoodChart } from "@/components/MoodChart";
import { WeeklySummary } from "@/components/WeeklySummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HistoryPage = () => {
  const [selectedTab, setSelectedTab] = useState("mood");

  return (
    <DashboardLayout pageTitle="History & Reports">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-wellness-green-dark mb-2">Your Wellness Journey</h2>
          <p className="text-gray-600">
            Track your mood patterns over time and download detailed summaries 
            to understand your emotional wellbeing.
          </p>
        </div>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>Mood & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mood">Mood History</TabsTrigger>
                <TabsTrigger value="reports">Weekly Summaries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mood" className="pt-6">
                <div className="space-y-8">
                  <MoodChart />
                  
                  {/* Mood patterns insights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-wellness-green-light/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Top Moods</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Calm</span>
                            <span className="text-sm text-gray-500">32%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-green h-2 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Happy</span>
                            <span className="text-sm text-gray-500">27%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-blue h-2 rounded-full" style={{ width: '27%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Anxious</span>
                            <span className="text-sm text-gray-500">18%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-yellow h-2 rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-wellness-blue-light/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Energy Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Morning</span>
                            <span className="text-sm text-gray-500">6.2/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-blue h-2 rounded-full" style={{ width: '62%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Afternoon</span>
                            <span className="text-sm text-gray-500">7.1/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-blue h-2 rounded-full" style={{ width: '71%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Evening</span>
                            <span className="text-sm text-gray-500">5.4/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-wellness-blue h-2 rounded-full" style={{ width: '54%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-wellness-purple-light/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Weekly Averages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between">
                              <span className="text-sm">Mood Score</span>
                              <span className="text-sm font-medium">6.8/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className="bg-wellness-green h-2 rounded-full" style={{ width: '68%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between">
                              <span className="text-sm">Energy Level</span>
                              <span className="text-sm font-medium">6.2/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className="bg-wellness-blue h-2 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between">
                              <span className="text-sm">Check-in Rate</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div className="bg-wellness-purple h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="pt-6">
                <WeeklySummary />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
