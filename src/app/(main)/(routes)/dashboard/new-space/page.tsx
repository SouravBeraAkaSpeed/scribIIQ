"use client"
import PulsatingButton from '@/components/pulsingButton'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { createSpace } from '@/lib/actions/room.actions'
import { createRoom } from '@/lib/sanity_client'
import { UserReference } from '@/lib/types'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { v4 } from 'uuid'

const Page = () => {

    const router = useRouter()
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
                } else {
                    router.push("/sign-in/?redirect_url=/dashboard/new-space")
                }
            } else {
                setSession(null);
            }
        };
        getSession();

    }, []);


    const addSpace = async () => {
        try {

            toast({
                title: "Creating new Space...."
            })

            if (session && session.user && session.user.email) {

                const room = await createSpace({
                    userId: (session?.user as {
                        name?: string | null,
                        email?: string | null,
                        image?: string | null,
                        id: string
                    })?.id, email: session?.user?.email
                })

                if (room) {



                    const owner = {
                        _type: 'reference',
                        _ref: (session?.user as {
                            name?: string | null,
                            email?: string | null,
                            image?: string | null,
                            id: string
                        })?.id,
                        _key: `${(session?.user as {
                            name?: string | null,
                            email?: string | null,
                            image?: string | null,
                            id: string
                        })?.id}`
                    } as UserReference

                    const dBroom = await createRoom({
                        roomId: room.id,
                        allowedUsers: [owner],
                        joinedUsers: [],
                        jsonData: {
                            data: ''
                        },
                        roomOwner: owner
                    }).catch((error) => {
                        console.log(error)
                    })

                    if (dBroom) {

                        router.push(`/space/${dBroom.roomId}`)
                    }

                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className=' w-full h-fulll'>

            <div className='flex flex-col w-full h-full   items-center justify-center'>
                <PulsatingButton onClick={() => addSpace()} className='text-white bg-black rounded-[10px] shadow-black shadow-sm'>
                    Create New Space
                </PulsatingButton>
                <span className='my-2 text-sm text-gray-500'>Let's do some work</span>
            </div>

        </div>
    )
}

export default Page