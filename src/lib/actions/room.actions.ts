"use server"
import { v4 } from "uuid";
import { liveblocks } from "../liveblocks";
import { RoomAccesses } from "@liveblocks/node";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";

export const createSpace = async ({ userId, email }: {
    userId: string,
    email: string
}) => {

    const roomId = v4()

    try {

        const metadata = {
            creatorId: userId,
            email: email,
            title: 'Untitled'
        }

        const usersAccesses: RoomAccesses = {
            [email]: ['room:write']
        }
        const room = await liveblocks.createRoom(roomId, {
            metadata,
            usersAccesses,
            defaultAccesses: ['room:write']
        });

        revalidatePath('/dashboard/manage-workspace')

        return parseStringify(room)
    } catch (error) {
        console.log("ERROR WHILE CREATING WORKSPACE :", error)
    }
}