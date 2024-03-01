import { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: ReactNode;
};
export function Modal({ children }: ModalProps) {
  return createPortal(
    <div className="modal">
      <div className="overlay"></div>
      <div className="modal-body">{children}</div>
    </div>,
    document.querySelector("#modal-container") as HTMLElement
  );
}
