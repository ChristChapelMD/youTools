import { Button } from "@nextui-org/button";
import NextLink from "next/link";

import { siteConfig } from "@/config/site"; // Adjust the import path as necessary

export default function Home() {
  return (
    <>
      {siteConfig.navItems.map((item: { href: string; label: string }) => (
        <NextLink key={item.href} passHref href={item.href}>
          <Button>{item.label}</Button>
        </NextLink>
      ))}
    </>
  );
}
