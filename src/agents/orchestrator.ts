import { detectIntent } from "./intent-router";
import { performUiAction } from "./ui-actions";

export interface OrchestratorResult {
  guide?: string;
  performed?: {
    sectionId: string;
    sectionLabel: string;
    success: boolean;
  };
}

export function handleUserInstruction(message: string): OrchestratorResult {
  const intent = detectIntent(message);
  if (intent.action) {
    const performed = performUiAction(intent.action);
    const guide = intent.guide ?? undefined;
    return { guide, performed };
  }
  return {};
}