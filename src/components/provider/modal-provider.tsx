"use client";

import { useEffect, useState } from "react";
import { WaitingListModal } from "../modals/WaitingListModal";
import { ExplainerModal } from "../modals/ExplainerModal";
import Appointment from "../modals/AppointmentModel";
import CollaborateModel from "../modals/ColloborateModel";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <WaitingListModal />
      <ExplainerModal />
      <Appointment />
      <CollaborateModel />
    </>
  );
};
