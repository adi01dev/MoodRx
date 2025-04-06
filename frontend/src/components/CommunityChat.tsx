
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Send, Users, Loader2, UserPlus, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Array<{
    _id: string;
    name: string;
    profilePicture?: string;
  }>;
  category: string;
  messages: Message[];
}

const CATEGORIES = [
  { value: "support", label: "Support Group" },
  { value: "wellness", label: "Wellness & Self-Care" },
  { value: "students", label: "Student Life" },
  { value: "positivity", label: "Positivity & Growth" },
  { value: "other", label: "Other" }
];

export function CommunityChat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: ""
  });
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/community');
      setGroups(response.data);
      
      // Set the first group as selected by default
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Could not load community groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/community/${groupId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: "Error",
        description: "Could not load group messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedGroup) return;

    setSendingMessage(true);

    try {
      const response = await api.post(`/api/community/${selectedGroup}/message`, {
        content: message,
      });
      
      // Add the new message to the list
      setMessages(prev => [...prev, response.data]);
      
      // Clear the input
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send your message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim() || !newGroup.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setCreatingGroup(true);

    try {
      const response = await api.post('/api/community', newGroup);
      
      // Add new group to list and select it
      setGroups(prev => [response.data, ...prev]);
      setSelectedGroup(response.data._id);
      
      // Reset form and close dialog
      setNewGroup({
        name: "",
        description: "",
        category: ""
      });
      
      setCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Community group created successfully!",
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Could not create community group",
        variant: "destructive",
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await api.post(`/api/community/${groupId}/join`);
      
      // Update groups list with the updated group
      setGroups(prev => prev.map(g => g._id === groupId ? response.data : g));
      
      toast({
        title: "Joined Group",
        description: "You have successfully joined the group",
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Could not join the group",
        variant: "destructive",
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const response = await api.post(`/api/community/${groupId}/leave`);
      
      // Update groups list with the updated group
      setGroups(prev => prev.map(g => g._id === groupId ? response.data : g));
      
      toast({
        title: "Left Group",
        description: "You have left the group",
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Could not leave the group",
        variant: "destructive",
      });
    }
  };

  const refreshGroups = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
    
    toast({
      title: "Refreshed",
      description: "Community groups have been refreshed",
    });
  };

  // Helper function to seed initial groups (development only)
  const seedGroups = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/community/seed');
      setGroups(response.data);
      
      if (response.data.length > 0) {
        setSelectedGroup(response.data[0]._id);
      }
      
      toast({
        title: "Success",
        description: "Initial community groups created",
      });
    } catch (error) {
      console.error('Error seeding groups:', error);
      toast({
        title: "Note",
        description: "Groups already exist or you don't have permission",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle key press to submit message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date for better readability
  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    
    return grouped;
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if user is a member of a group
  const isGroupMember = (group: Group) => {
    return group.members.some(member => member._id === user?.id);
  };

  return (
    <Card className="flex flex-col min-h-[600px] shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Community Support
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshGroups} 
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Community Group</DialogTitle>
                  <DialogDescription>
                    Create a new group to connect with others on similar wellness journeys.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Give your group a name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Description</Label>
                    <Textarea
                      id="group-description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="What is this group about?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-category">Category</Label>
                    <Select
                      value={newGroup.category}
                      onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createGroup} disabled={creatingGroup}>
                    {creatingGroup ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0">
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="px-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col">
            {loading && !messages.length ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
              </div>
            ) : selectedGroup ? (
              <>
                <div className="border-b p-2 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {groups.find(g => g._id === selectedGroup)?.name || "Loading..."}
                    </span>
                    {selectedGroup && groups.find(g => g._id === selectedGroup) && (
                      isGroupMember(groups.find(g => g._id === selectedGroup) as Group) ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => leaveGroup(selectedGroup)}
                        >
                          Leave
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => joinGroup(selectedGroup)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Be the first to say hello!
                    </div>
                  ) : (
                    Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
                      <div key={date} className="space-y-4">
                        <div className="flex justify-center">
                          <Badge variant="outline" className="bg-background">
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Badge>
                        </div>
                        
                        {msgs.map((msg) => (
                          <div 
                            key={msg._id} 
                            className={`flex ${msg.user._id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex ${msg.user._id === user?.id ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                              <Avatar className={`h-8 w-8 ${msg.user._id === user?.id ? 'ml-2' : 'mr-2'}`}>
                                <AvatarImage src={msg.user.profilePicture || ""} />
                                <AvatarFallback className={
                                  msg.user._id === user?.id 
                                    ? "bg-wellness-green-light text-wellness-green-dark" 
                                    : "bg-wellness-purple-light text-wellness-purple-dark"
                                }>
                                  {getInitials(msg.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className={`rounded-lg p-3 text-sm ${
                                  msg.user._id === user?.id 
                                    ? 'bg-wellness-green text-white' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {msg.content}
                                </div>
                                <div className={`text-xs text-gray-500 mt-1 ${
                                  msg.user._id === user?.id ? 'text-right' : 'text-left'
                                }`}>
                                  {msg.user.name} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t">
                  {selectedGroup && groups.find(g => g._id === selectedGroup) && (
                    isGroupMember(groups.find(g => g._id === selectedGroup) as Group) ? (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          disabled={sendingMessage}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || sendingMessage}
                          className="bg-wellness-green hover:bg-wellness-green-dark text-white"
                        >
                          {sendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground p-2">
                        Join this group to send messages
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a group to start chatting
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="groups" className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <h3 className="text-lg font-medium">No community groups yet</h3>
                <p className="text-sm text-muted-foreground">Create a new group or seed initial groups</p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={seedGroups}>
                    Create Initial Groups
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => (
                  <div 
                    key={group._id} 
                    className={`p-4 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGroup === group._id ? 'border-wellness-green bg-wellness-green-light/10' : ''
                    }`}
                    onClick={() => setSelectedGroup(group._id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <Badge variant="outline">
                        {group.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </div>
                      {!isGroupMember(group) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            joinGroup(group._id);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
