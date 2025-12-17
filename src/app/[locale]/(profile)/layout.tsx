import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Profile route group layout
 * No Header/Footer - profiles are designed as standalone personal websites
 */
export default function ProfileGroupLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen">
      {children}
    </div>
  );
}
