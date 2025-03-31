"use client";

import { Suspense } from "react";
import AddOrEditGraczPageContent from "./AddOrEditGraczPageContent";

export default function AddPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddOrEditGraczPageContent />
    </Suspense>
  );
}
