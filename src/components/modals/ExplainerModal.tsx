"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "../hooks/useModal";
import Image from "next/image";

export const ExplainerModal = () => {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const isModalOpen = isOpen && type === "ExplainerModal";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%]  bg-[#09090B] p-6   text-white shadow-md shadow-gray-800 ">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-center text-xl font-bold">
            {data?.data?.topic}
          </DialogTitle>
        </DialogHeader>
        <div className=" w-full overflow-y-auto max-h-[550px]">
          <div className="py-10 text-justify  text-lg font-bold text-gray-400">
            {data?.data?.description}
          </div>
          <div className="flex w-full p-2">

          {data?.data?.mappedImage && data?.data?.item && (
            <Image
              id={`image_${data?.data?.item}`}
              src={data?.data?.mappedImage}
              alt={`image_${data?.data?.item}`}
              width={500}
              height={500}
              className=" h-full w-full rounded-xl object-contain"
            />
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
