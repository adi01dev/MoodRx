export  interface GroupType {
    _id: string;
    name: string;
    description: string;
    members: {
      _id: string;
      name: string;
      profilePicture?: string;
    }[];
    messages: {
      _id: string;
      text: string;
      user: {
        _id: string;
        name: string;
        profilePicture?: string;
      };
      createdAt: string;
    }[];
  }
  