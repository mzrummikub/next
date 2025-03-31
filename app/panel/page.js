"use client";

import { Suspense } from "react";
import PanelPageContent from "./PanelPageContent";

export default function PanelPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <PanelPageContent />
    </Suspense>
  );
}
