"use client"
import React, { useEffect, useState } from 'react'
import { ClientSideSuspense, LiveblocksProvider } from '@liveblocks/react/suspense'
import Loader2 from '../Loader2'
import { Session } from 'next-auth'

const Provider = ({ children }: { children: React.ReactNode }) => {


    const [session, setSession] = useState<Session | null>(null);
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
                }
            } else {
                setSession(null);
            }
        };
        if (!session) {

            getSession();
        }

    }, [session]);
    return (
        <LiveblocksProvider authEndpoint={async (room) => {
            const response = await fetch("/api/liveblocks-auth", {
                method: "POST",
                body: JSON.stringify({ room, session }),
            });
            return await response.json();
        }} >

            <ClientSideSuspense fallback={<div className="fixed inset-0 m-auto z-100  bg-white w-full h-full flex  flex-1 items-center justify-center text-white">
                <Loader2 />
            </div>}>
                {children}
            </ClientSideSuspense>

        </LiveblocksProvider>
    )
}

export default Provider