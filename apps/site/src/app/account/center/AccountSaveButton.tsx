"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function AccountSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton" type="submit" disabled={pending} aria-live="polite">
      {pending ? (
        <>
          <LoaderCircle className="saveSpinner" size={16} />
          Saving...
        </>
      ) : (
        <>
          Save changes
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}
