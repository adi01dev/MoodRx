
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search, BookOpen, Trash2 } from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
}

export function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/journal/entries');
      console.log("Fetched entries:", response.data);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: "Error",
        description: "Could not load journal entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsEntryOpen(true);
  };

  const deleteEntry = async (id: string) => {
    try {
      await api.delete(`/journal/entries/${id}`);
      
      // Remove from state
      setEntries(entries.filter(entry => entry.id !== id));
      
      // Close dialog if open
      if (selectedEntry?.id === id) {
        setIsEntryOpen(false);
      }
      
      toast({
        title: "Entry deleted",
        description: "Journal entry has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Could not delete the journal entry",
        variant: "destructive",
      });
    }
  };

  // Filter entries based on search term
  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get a preview of the content (first 100 characters)
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle>Your Journal Entries</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                className="pl-8 pr-4 py-2 text-sm border rounded-md w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-wellness-green focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any journal entries yet.</p>
              <p className="text-sm mt-1">Your journal entries will appear here once you start writing.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No entries match your search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => viewEntry(entry)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{entry.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{getContentPreview(entry.content)}</p>
                  {entry.mood && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wellness-blue-light text-wellness-blue-dark">
                        Mood: {entry.mood}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Detail Dialog */}
      <Dialog open={isEntryOpen} onOpenChange={setIsEntryOpen}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEntry.title}</DialogTitle>
              <DialogDescription>
                {new Date(selectedEntry.createdAt).toLocaleDateString()} at {new Date(selectedEntry.createdAt).toLocaleTimeString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2 whitespace-pre-wrap text-gray-700">
              {selectedEntry.content}
            </div>
            
            {selectedEntry.mood && (
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wellness-blue-light text-wellness-blue-dark">
                  Mood: {selectedEntry.mood}
                </span>
              </div>
            )}
            
            <DialogFooter className="flex justify-between items-center mt-4">
              <Button
                variant="destructive"
                onClick={() => deleteEntry(selectedEntry.id)}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
