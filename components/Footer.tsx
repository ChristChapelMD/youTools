import { Divider } from "@nextui-org/divider";

import { ThemeSwitch } from "./theme-switch";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-center py-8">
      <h6 className="">Copyright YRS</h6>
      <Divider orientation="vertical" />
      <ThemeSwitch />
    </footer>
  );
}
