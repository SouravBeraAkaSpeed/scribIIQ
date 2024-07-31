"use client"

import { Button } from '@/components/ui/button'
import WorkSpacePopOver from '@/components/WorkSpace/spacePopOver'
import { workspaceType } from '@/lib/types'
import { BellRing, ChartNoAxesGantt, FolderKanban, Rocket, Settings, Sparkle, Sparkles, User, Users, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isSideBar, setIsSideBar] = useState(true)
    const router = useRouter();
    const workspaces: workspaceType[] = [
        { id: "1", label: 'Workspace 1' },
        { id: "2", label: 'Workspace 2' },
        { id: "3", label: 'Workspace 3' }
    ];
    const pathname = usePathname()
    const tab = pathname.split("/")[2]
    return (
        <div className='h-full w-full flex flex-col'>
            <div className='flex h-full w-full'>
                <div className={`h-full absolute z-20 lg:w-[20%] md:w-[30%] px-3   bg-black text-white  flex-col  ${isSideBar ? 'flex w-[70%] ' : 'hidden'}  border-r-2`}>
                    <div className={` md:hidden flex items-start  w-full  justify-end p-3 space-x-3`}>
                        <div onClick={() => setIsSideBar((prev) => !prev)} className='flex   p-2 '>
                            <X className='font-bold' />
                        </div>
                    </div>

                    <div className='w-full p-2 py-2 md:py-7 text-black font-semibold '>
                        <WorkSpacePopOver workspaces={workspaces} />
                    </div>

                    <div onClick={() => router.push("/dashboard/new-space")} className={`cursor-pointer ${tab == "new-space" && 'bg-[#262726] rounded-[10px]'} flex items-center space-x-2  m-2 p-2  text-md text-white font-semibold `}>
                        <Rocket className='mx-2' />  Create New Space
                    </div>

                    <div onClick={() => router.push("/dashboard/manage-spaces")} className={`cursor-pointer ${tab == "manage-spaces" && 'bg-[#262726] rounded-[10px]'} m-2 mt-1 p-2  flex items-center space-x-2  text-md text-white font-semibold `}>
                        <FolderKanban className='mx-2' /> Manage spaces
                    </div>
                    <div onClick={() => router.push("/dashboard/schedule-space-meetings")} className={`cursor-pointer ${tab == "schedule-space-meetings" && 'bg-[#262726] rounded-[10px]'} m-2 mt-1 p-2  flex items-center space-x-2  text-md text-white font-semibold `}>
                        <Users className='mx-2' /> Schedule Space Meeting
                    </div>
                    <div onClick={() => router.push("/dashboard/settings")} className={`cursor-pointer ${tab == "settings" && 'bg-[#262726] rounded-[10px]'} m-2 mt-1 p-2   flex items-center space-x-2 text-md text-white font-semibold `}>
                        <Settings className='mx-2' />  Settings
                    </div>


                    <div className={` w-full flex flex-col m-2 mt-1 justify-end items-stretch flex-1   text-md text-white font-semibold `}>
                        <Button onClick={() => router.push("/dashboard/upgrade-plan")} className='cursor-pointer flex items-center justify-between'>
                            <Sparkles className=' rounded-full border-1  p-1' size={24} /><div className='flex flex-1 p-2'> Upgrade Plan</div>
                        </Button>
                    </div>
                </div>
                <div className='flex absolute right-0 flex-col h-full  lg:w-[80%] md:w-[70%] w-full'>

                    <div className='flex w-full  justify-between'>

                        <div className={`md:hidden flex items-center w-full  justify-start p-3 space-x-3`}>
                            <div onClick={() => setIsSideBar((prev) => !prev)} className='flex  p-2 '>
                                <ChartNoAxesGantt />
                            </div>
                        </div>
                        <div className='flex items-center w-full justify-end  p-3 space-x-3'>
                            <div className='flex cursor-pointer font-bold p-2 rounded-full'>
                                <BellRing />
                            </div>
                            <div className='flex cursor-pointer font-bold p-2 rounded-full'>
                                <User />
                            </div>
                        </div>

                    </div>
                    <div className='flex w-full  h-full'>

                        {children}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout