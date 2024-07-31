"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import nodemailer from "nodemailer";
// import winston from "winston";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {  useState } from "react";
import { useModal } from "../hooks/useModal";
import { WaitingListSchema } from "@/lib/FormSchema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { createWaitingList } from "@/lib/sanity_client";
import { DialogDescription } from "@radix-ui/react-dialog";


export const WaitingListModal = () => {
  const { isOpen, onClose, type,  } = useModal();
  const isModalOpen = isOpen && type === "JoinWaitingList";
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);


  
  

  const WaitingForm = useForm<z.infer<typeof WaitingListSchema>>({
    mode: "onChange",
    resolver: zodResolver(WaitingListSchema),
    defaultValues: {
      full_name: "",
      email: "",
      interestingInSubscription: false,
      intrestedInUpdates: false,
    },
  });

  const isWaiting = WaitingForm.formState.isSubmitting;

  const onWaitingSubmit: SubmitHandler<
    z.infer<typeof WaitingListSchema>
  > = async (formData) => {
    try {
      setIsLoading(true);
      const res = await createWaitingList(formData);
      if (res) {
        setIsLoading(false);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] overflow-hidden bg-[#09090B] p-6   text-white shadow-md shadow-gray-800 ">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-2xl font-bold">
            Join Waiting List 🚀
          </DialogTitle>
          <DialogDescription className="text-center text-lg ">
            Get unlimited free credits to access the ai.
          </DialogDescription>
        </DialogHeader>
        <div className=" w-full">
          {isSubmitted ? (
            <div className="py-10 text-center text-xl font-bold text-gray-400">
              Thanks for Joining Neura Ai , You Will Soon Get The Email
              Invitation With 10$ Worth Of Credits To Use Neura.
            </div>
          ) : (
            <Form {...WaitingForm}>
              <form
                onChange={() => {}}
                onSubmit={WaitingForm.handleSubmit(onWaitingSubmit)}
                className="mt-6 flex  flex-col items-center justify-center space-y-8  "
              >
                <div className="flex  w-full  justify-center">
                  <div className="mx-7 flex  w-full flex-col">
                    <Label className="font-semibold">Full Name </Label>
                    <FormField
                      disabled={isWaiting}
                      control={WaitingForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              className=" mt-2  text-white"
                              placeholder="Ex: John Smith"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex  w-full  justify-center">
                  <div className="mx-7 flex  w-full flex-col">
                    <Label className="font-semibold">Email </Label>
                    <FormField
                      disabled={isWaiting}
                      control={WaitingForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              className=" mt-2  text-white"
                              placeholder="Ex: John@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex  w-full  justify-center">
                  <div className="mx-7 flex w-full items-center  sm:justify-center  space-x-4">
                    <Label className="flex font-semibold ">
                      Interested in Neura Ai&apos;s subscription?
                    </Label>
                    <FormField
                      disabled={isWaiting}
                      control={WaitingForm.control}
                      name="interestingInSubscription"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              onCheckedChange={field.onChange}
                              className="  flex  text-white"
                              checked={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex  w-full  justify-center  ">
                  <div className="mx-7 flex  w-full items-center sm:justify-center  space-x-4">
                    <Label className="font-semibold">Want Neura Ai&apos;s updates ?</Label>
                    <FormField
                      disabled={isWaiting}
                      control={WaitingForm.control}
                      name="intrestedInUpdates"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              onCheckedChange={field.onChange}
                              className=" flex text-white"
                              checked={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center w-full">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-[93%] border-2 border-black bg-black text-white  hover:bg-gray-300 hover:text-black"
                  >
                    {isLoading ? `Loading...` : `Submit`}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
