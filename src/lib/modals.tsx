import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BookAppointmentModal } from "@/components/modals/BookAppointmentModal";
import { NewPatientModal } from "@/components/modals/NewPatientModal";
import { CreateInvoiceModal } from "@/components/modals/CreateInvoiceModal";
import { UploadLabReportModal } from "@/components/modals/UploadLabReportModal";
import { ConsultationModal } from "@/components/modals/ConsultationModal";

export type ActiveModal =
  | "book-appointment"
  | "new-patient"
  | "create-invoice"
  | "upload-lab-report"
  | "consultation"
  | null;

export interface ModalPayload {
  patientId?: string | null;
  patientName?: string | null;
  file?: File | null;
}

interface ModalsCtx {
  active: ActiveModal;
  payload: ModalPayload;
  /** Incremented on every successful modal save — pages subscribe via useEffect to refetch. */
  version: number;
  open: (modal: ActiveModal, payload?: ModalPayload) => void;
  close: () => void;
}

const Ctx = createContext<ModalsCtx>({
  active: null, payload: {}, version: 0, open: () => {}, close: () => {},
});

export function ModalsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveModal>(null);
  const [payload, setPayload] = useState<ModalPayload>({});
  const [version, setVersion] = useState(0);

  const open = useCallback((modal: ActiveModal, p: ModalPayload = {}) => {
    setPayload(p);
    setActive(modal);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    setPayload({});
  }, []);

  const success = useCallback(() => {
    setVersion((v) => v + 1);
    close();
  }, [close]);

  const value = useMemo(() => ({ active, payload, version, open, close }), [active, payload, version, open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <BookAppointmentModal
        isOpen={active === "book-appointment"}
        onClose={close}
        onSuccess={success}
        prefillPatientId={payload.patientId ?? null}
        prefillPatientName={payload.patientName ?? null}
      />
      <NewPatientModal
        isOpen={active === "new-patient"}
        onClose={close}
        onSuccess={success}
      />
      <CreateInvoiceModal
        isOpen={active === "create-invoice"}
        onClose={close}
        onSuccess={success}
      />
      <UploadLabReportModal
        isOpen={active === "upload-lab-report"}
        onClose={close}
        onSuccess={success}
        initialFile={payload.file ?? null}
      />
      <ConsultationModal
        isOpen={active === "consultation"}
        onClose={close}
        onSuccess={success}
        patientId={payload.patientId ?? null}
        patientName={payload.patientName ?? null}
      />
    </Ctx.Provider>
  );
}

export const useModals = () => useContext(Ctx);
