export type UiAction = "file_upload" | "secondary_upload" | "history";

const TAB_VALUES: Record<UiAction, string> = {
  file_upload: "upload",
  secondary_upload: "upload2",
  history: "historial",
};

const TAB_LABELS: Record<UiAction, string> = {
  file_upload: "Subir Imagenes",
  secondary_upload: "Subir Documentos",
  history: "Historial",
};

export function performUiAction(action: UiAction): { sectionId: string; sectionLabel: string; success: boolean } {
  const value = TAB_VALUES[action];
  const label = TAB_LABELS[action];
  const success = typeof window !== "undefined";
  if (success) {
    try {
      const evt = new CustomEvent("app:set-tab", { detail: { value } });
      window.dispatchEvent(evt);
    } catch {
      // noop
    }
  }
  return { sectionId: value, sectionLabel: label, success };
}