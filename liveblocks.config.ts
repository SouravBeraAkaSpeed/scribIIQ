// Define Liveblocks types for your application

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      spaceData: string;

      // Example, real-time cursor coordinates
      // cursor: { x: number; y: number };
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      // Example, a conflict-free list
      // animals: LiveList<string>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        id: string;
        name: string;
        email: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {};
    // Example has two events, using a union
    // | { type: "PLAY" } 
    // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string
      // url: string;
    };
  }
}

// const getSession = async () => {
//   const token = localStorage.getItem("sessionToken");
//   if (token) {
//     const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
//     const data = await sessionRes.json();
//     return {
//       session: {
//         user: data.user,
//         expires: data.expires,
//       }
//     }

//   }
//   return {
//     session: null
//   }
// };

// const client = createClient({
//   authEndpoint: async (room) => {
//     const { session } = await getSession()
//     if (session) {

//       const response = await fetch("/api/liveblocks-auth", {
//         method: "POST",
//         body: JSON.stringify({
//           room, session
//         }),
//       });
//       return await response.json();
//     }
//   },
// });

// type Presence = {};
// type Storage = {};
// type UserMeta = {};
// type RoomEvent = {};
// type ThreadMetadata = {};

// export const {
//   RoomProvider,
//   useMyPresence,

//   // Other hooks
//   // ...
// } = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
//   client
// );
