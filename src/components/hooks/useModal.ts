import { create } from "zustand";

export type ModalType =
  | "JoinWaitingList"
  | "ExplainerModal"
  | "AppointmentModel"
  | "CollaborateModal";

interface ModalData {
  data?: {
    topic?: string;
    description?: string;
    item?: string;
    mappedImage?: string;
    formType?: "create" | "schedule" | "cancel";
    user?: {
      email?: string | undefined | null;
      name?: string | undefined;
      id?: string
    };
    room?: {

      roomId?: string,
      usersInRoom?: string[]
    }
  };
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => {
    set({ isOpen: true, type, data })
  },
  onClose: () => set({ type: null, isOpen: false }),
}));
