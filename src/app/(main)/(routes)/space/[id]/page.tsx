"use client"
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense';
import Loader2 from '@/components/Loader2';
import { Session } from 'next-auth';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

import { checkRoomIsAllowed, joinRoom } from '@/lib/sanity_client';


interface WorkspaceProps {

  params: {
    id: string;
  }
}
const Canvas = dynamic(() => import('@/components/Canvas/canvas'), {
  ssr: false
})

const Page = ({ params }: WorkspaceProps) => {
  const [isAllowed, setIsAllowed] = useState(false)
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter()



  let isFirst = true

  useEffect(() => {
    const getSession = async () => {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
        const data = await sessionRes.json();
        if (data.user) {
          setSession({
            user: data.user,
            expires: data.expires,
          });

        } else {
          setSession(null)
          toast({
            title: "Login Required!!"
          })

          router.push(`/sign-in/?redirect_url=/space/${params.id}`)
        }
      }
    };

    if (isFirst) {

      isFirst = false
      getSession()


    }


  }, [])

  useEffect(() => {
    const checkAllowedRoomAndJoin = async () => {
      if (!session?.user) return;

      const userId = (session?.user as {
        name?: string | null,
        email?: string | null,
        image?: string | null,
        id: string
      })?.id;
      const allowed = await checkRoomIsAllowed(params.id, userId);

      console.log("alllowed:", allowed)

      if (allowed) {

        const joinResult = await joinRoom(params.id, userId)

        if (joinResult) {
          toast({
            title: `${session.user.name} joined the Space`
          });

          setIsAllowed(true);
        }
      } else {
        toast({
          title: "ACCESS PROHIBITED !!",
          variant: "destructive",
          description: "redirecting to dashboard..."
        });

        router.push("/dashboard")
      }


    };

    // Only run the check and join logic if the session is set and valid
    if (session !== null) {
      checkAllowedRoomAndJoin();

    }
  }, [session]);




  if (!isAllowed) {
    return (

      <div className="fixed inset-0 m-auto z-100  bg-white w-full h-full flex  flex-col space-y-10 flex-1 items-center justify-center text-black">
        <Loader2 />
        <div className="flex">
          Loading
        </div>
      </div>
    )
  }

  return (
    <RoomProvider id={params.id} initialPresence={{ cursor: { x: 500, y: 500 }, spaceData: "" }} >
      <ClientSideSuspense fallback={<div className="fixed inset-0 m-auto z-100  bg-white w-full h-full flex  flex-col space-y-10 flex-1 items-center justify-center text-black">
        <Loader2 />
        <div className="flex">
          Loading
        </div>
      </div>}>
        <Canvas params={params} session={session} setSession={setSession} />
      </ClientSideSuspense>
    </RoomProvider>
  )
}

export default Page