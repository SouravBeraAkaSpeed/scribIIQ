"use client"
import React, { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Check, ChevronsUpDown } from "lucide-react"
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { workspaceType } from '@/lib/types';



interface WorkSpacePopOverProps {
    workspaces: workspaceType[];
}

const WorkSpacePopOver: React.FC<WorkSpacePopOverProps> = ({ workspaces }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredWorkspaces, setFilteredWorkspaces] = useState<workspaceType[]>(workspaces);

    useEffect(() => {
        setFilteredWorkspaces(
            workspaces.filter(workspace =>
                workspace.label
                .toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, workspaces]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <Popover>
            <PopoverTrigger className='w-full   '>
                <div className="px-4 py-2 w-full  bg-white flex items-center justify-between   hover:bg-white text-black  rounded"> <div >Select Workspace</div> <ChevronsUpDown size={20} /></div>
            </PopoverTrigger>
            <PopoverContent className='w-full bg-white'>


                <Input
                    placeholder="Search Workspaces"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <ul className="mt-2">
                    {filteredWorkspaces.map(workspace => (
                        <li key={workspace.id} className="py-2 text-md">
                            {workspace.label}
                        </li>
                    ))}
                </ul>

            </PopoverContent>
        </Popover>
    );
};

export default WorkSpacePopOver;
