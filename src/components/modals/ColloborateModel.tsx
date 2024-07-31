"use client"
import React, { useEffect, useState } from 'react'
import { useModal } from '../hooks/useModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { addUserToAllowedList, fetchUserByRoom, fetchUsersByEmail } from '@/lib/sanity_client';
import { User, UserCircle, UserCircle2, UserCircle2Icon } from 'lucide-react';

const CollaborateModel = () => {
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "CollaborateModal";
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<{ _id: string, email: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ _id: string, email: string }[]>([]);

    useEffect(() => {
        const searchUsers = async () => {
            if (searchEmail.length > 2) {
                const users = await fetchUsersByEmail(searchEmail);
                setSearchResults(users);
            } else {
                setSearchResults([]);
            }
        };

        searchUsers();
    }, [searchEmail]);


    useEffect(() => {

        const getUSers = async () => {
            if (data.data?.room?.roomId) {

                const users = await fetchUserByRoom(data.data?.room?.roomId)

                console.log(users)

                if (users) {
                    setSelectedUsers(users)
                }
            }

        }

        getUSers()

    }, [data.data?.room?.roomId])


    const handleAddUser = async (user: { _id: string, email: string }) => {
        if (!selectedUsers.some(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
            await addUserToAllowedList(data?.data?.room?.roomId, user._id);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose} >

            <DialogContent className="sm:max-w-[425px] z-200">
                <DialogHeader>
                    <DialogTitle>Collaborate with multiple users</DialogTitle>
                    <DialogDescription>
                        Add the users and hare the joining link to collaborate with multiple users simultaneously.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Search by email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />

                    <div className="space-y-2">
                        {searchResults.map((user) => (
                            <div key={user._id} className="flex justify-between items-center">
                                <span>{user.email}</span>
                                <Button onClick={() => handleAddUser(user)}>Add</Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <h4>Allowed Users:</h4>
                        {selectedUsers.map((user) => (
                            <div key={user._id} className="flex justify-start space-x-4 items-center">
                              <UserCircle2Icon/>  <span className='text-lg font-bold'>{user.email}</span>
                            </div>
                        ))}
                    </div>
                </div>




            </DialogContent>
        </Dialog>
    )
}

export default CollaborateModel