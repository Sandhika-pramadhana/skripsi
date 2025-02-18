/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { cn } from "@/features/core/lib/utils";
import React from "react";

type DescriptionListItem = [string, React.ReactNode];

export function DescriptionList({
  data,
  className,
  skipEmpty,
  fallback,
}: {
  data:
    | { [key: string]: React.ReactNode }
    | { label: string; value: React.ReactNode }[];
  className?: { container?: string, label?: string; value?: string };
  skipEmpty?: boolean;
  fallback?: React.ReactNode;
}) {
  const filter = skipEmpty 
    ? (v: DescriptionListItem) => typeof v[1] === "string" ? v[1].length != 0 : v[1] != null
    : (v: DescriptionListItem) => true;

  const _data: DescriptionListItem[] = Array.isArray(data)
    ? data.map((v) => [v.label, v.value])
    : Object.entries(data);

  return (
    <dl
      className={cn(
        "grid grid-cols-[8rem_1fr] gap-x-2 gap-y-1 items-baseline",
        className?.container
      )}
    >
      {_data.filter(filter).map(([key, value]) => (
        <React.Fragment key={key}>
          <dt className={cn("text-sm font-semibold text-muted-foreground min-w-32", className?.label)}>{key}</dt>
          <dd className={className?.value}>{value || fallback}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
