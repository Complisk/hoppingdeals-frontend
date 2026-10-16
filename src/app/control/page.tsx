import type { Metadata } from "next";
import AutoCtrlPress from "@/components/testscript/AutoCtrlPress";

export const metadata: Metadata = {
  title: "Control",
  robots: { index: false, follow: false },
};

export default function ControlPage() {
  return <AutoCtrlPress />;
}
