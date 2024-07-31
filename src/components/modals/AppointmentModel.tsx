"use client";

import { useModal } from "../hooks/useModal";
import { AppointmentForm } from "../forms/AppointmentForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

const Appointment = () => {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const isModalOpen = isOpen && type === "AppointmentModel";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[95%] shadow-insert min-w-[40%] flex-col items-center justify-start  bg-white p-4   text-black shadow-md shadow-gray-800 ">
        <DialogHeader className="w-[95%] p-1 px-10">
          <DialogTitle className="w-[95%] text-left  text-3xl font-bold">
            {data?.data?.formType === "create" && "New zoom appointment"}
          </DialogTitle>
          <DialogDescription>
            Book a free appointment in 10 seconds.
          </DialogDescription>
        </DialogHeader>
        <div className="z-50 flex h-[85%]  w-[95%]  text-black">
          <section className=" container my-auto w-full">
            <AppointmentForm
              close={onClose}
              emailAddress={data?.data?.user?.email}
              formType="create"
              fullname={data?.data?.user?.name}
            />
          </section>
        </div>
        <div className="flex">
          All Rights Reserved | @toil-labs

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Appointment;
