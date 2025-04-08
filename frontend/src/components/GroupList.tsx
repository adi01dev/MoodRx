import React from 'react';

import { Button } from "@/components/ui/button"; // Adjust import if needed

interface Member {
  _id: string;
  name: string;
  profilePicture?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Member[];
}

interface GroupListProps {
  groups: Group[];
  currentUserId: string;
  joinGroup: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, currentUserId, joinGroup }) => {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group._id} className="p-4 border rounded shadow-sm">
          <h3 className="font-semibold">{group.name}</h3>
          <p className="text-sm text-gray-600">{group.description}</p>

          {!group.members.some((member) => member._id === currentUserId) && (
            <Button onClick={() => joinGroup(group._id)} className="mt-2">
              Join Group
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupList;
