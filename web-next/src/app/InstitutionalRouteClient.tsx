"use client";

import InstitutionalPage, { type InstitutionalKind } from "../views/InstitutionalPage";

export default function InstitutionalRouteClient({ kind }: { kind: InstitutionalKind }) {
  return <InstitutionalPage kind={kind} />;
}
