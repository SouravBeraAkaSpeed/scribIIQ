
import { DefaultUser, DefaultSession } from 'next-auth';


export type messageType = {
  createdAt: Date;
  role: string;
  content: string;
  images?: string[];
};

export type messagesType = [messageType];

export type contact = {
  name: string;
  email: string;
  phone: string;
  service_name?: string;
  query: string;
};

export type waitingForm = {
  full_name: string;
  email: string;
  interestingInSubscription: boolean;
  intrestedInUpdates: boolean;
};




export interface CustomUser extends DefaultUser {
  _id: string;
  email: string;
  password: string;
}

export interface CustomSession extends DefaultSession {
  user: CustomUser & DefaultSession["user"] & { id: string };
}

export interface Credentials {
  email: string;
  password: string;
}


export interface workspaceType {
  id: string;
  label: string;

}

export interface RoomType {

  roomId: string
  allowedUsers: UserReference[]
  joinedUsers: UserReference[]
  jsonData: {
    data: string
  },
  roomOwner: UserReference
}

export interface UserReference {
  _type: 'reference'
  _ref: string
  _key: string
}

