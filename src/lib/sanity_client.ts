import { createClient } from "@sanity/client";
import { contact, RoomType, UserReference, waitingForm } from "./types";

export const client = createClient({
  projectId: "o8ddx74t",
  dataset: "production",
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: "2024-06-08", // use current date (YYYY-MM-DD) to target the latest API version
  token:
    "sk968WqbJ33psvFEtF6vNvByuYAt5zCuu5foq0qSTnROucnY8SG2IDb5GXFTjweKRDwXuvZ4mPT7x7AbBWnMIArFGGgizsuazspbwDautIDxo91uJu9YcYUaioo2wT4vAHKHum8luHxFl5aNxnfv6pXefKjRXtHdXsG40DWmR0v0xKByekbb",
});

export const createContact = async (contact: contact) => {
  try {
    const res = await client.create({ ...contact, _type: "contact" });
    return res;
  } catch (error) {
    console.log("CREATE_CONTACT_ERROR ", error);
    return null;
  }
};

export const createWaitingList = async (data: waitingForm) => {
  try {
    const res = await client.create({ ...data, _type: "join_waiting_list" });
    return res;
  } catch (error) {
    console.log("CREATE_WAITING_LIST_ERROR ", error);
    return null;
  }
};


export const getWaitingListCount = async () => {

  try {
    const res = await client.fetch(`count(*[ _type == "join_waiting_list"])`);
    return res;

  } catch (error) {
    console.log("GETWAITINNGLISTT_COUNT_ERROR", error);
    return null;
  }
}


export const createRoom = async (roomData: RoomType) => {

  try {
    const room = await client.create({ ...roomData, _type: "room" })
    return room;
  } catch (error) {
    console.log("ERROR_CREATE_ROOM:", error)
    return null;
  }

}

export const checkRoomIsAllowed = async (roomId: string, userId: string) => {
  try {
    const room: RoomType = await client.fetch(
      `*[_type == "room" && roomId == "${roomId}"][0]`,

    )

    // Check if the room exists
    if (!room) {
      console.log('Room not found')
      return false
    }

    console.log(room, room.allowedUsers)

    // Check if the user is in the allowedUsers list
    const isAllowed = room.allowedUsers.some((user: UserReference) => user._ref === userId)

    return isAllowed
  } catch (error) {
    console.log("ERROR_CHECK_ALLOWED_ROOMS:", error);
    return false
  }
}


export const joinRoom = async (roomId: string, userId: string) => {
  try {
    // Fetch the room document
    const room = await client.fetch(
      `*[_type == "room" && roomId == "${roomId}"][0]`,

    )


    // Check if the room exists
    if (!room) {
      console.log('Room not found')
      return false
    }

    // Check if the user is already in the joinedUsers list
    const userAlreadyJoined = room.joinedUsers.some(
      (user: UserReference) => {

        return user._ref === userId
      }
    )


    if (userAlreadyJoined) {
      // console.log('User already joined the room')
      return true
    }

    const userReference: UserReference = {
      _type: 'reference',
      _ref: userId,
      _key: `${userId}-${Date.now()}`,
    }

    // Perform the check and update in a transaction
    const result = await client
      .transaction()
      .patch(room._id, (patch) =>
        patch
          .setIfMissing({ joinedUsers: [] })
          .append('joinedUsers', [userReference])
      )
      .commit()



    return true





  } catch (error) {
    console.log('ERROR_JOIN_ROOM:', error)
    return false
  }
}


export const fetchUsersByEmail = async (email: string) => {
  try {
    const users = await client.fetch(
      `*[_type == "user" &&  email match "${email}*"]{_id, email}`
    );
    return users;
  } catch (error) {
    console.error("Error fetching users by email:", error);
    return [];
  }
};


export const addUserToAllowedList = async (roomId: string | undefined, userId: string) => {
  try {
    if (roomId) {
      const room = await client.fetch(
        `*[_type == "room" && roomId == "${roomId}"][0]._id`
      );

      if (room) {
        await client
          .patch(room)
          .setIfMissing({ allowedUsers: [] })
          .append('allowedUsers', [{ _type: 'reference', _ref: userId, _key: `${userId}` }])
          .commit();
        
      } else {
        console.error(`Room with roomId ${roomId} not found`);
      }
    }
  } catch (error) {
    console.error("Error adding user to allowed users list:", error);
  }
};


export const fetchUserByRoom = async (roomId: string | undefined) => {
  try {
    if (roomId) {

      const users = await client.fetch(
        `*[_type == "room" && roomId == "${roomId}"]{
          allowedUsers[]->{_id, email}
        }[0]`
      );

      console.log("users:", users)
      return users?.allowedUsers || []
    }

  } catch (error) {
    console.log("ERROR_FETCH_USER_BY_ROOM:", error)
  }
}