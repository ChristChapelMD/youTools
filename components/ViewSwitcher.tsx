"use client";

import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Spacer } from "@nextui-org/spacer";

export default function ViewSwitcher() {
  return (
    <section className="flex flex-row w-full justify-between align-middle">
      <div>
        <h1 className="text-4xl font-bold">Weekly View</h1>
        <Spacer y={4} />
      </div>
      <Dropdown>
        <DropdownTrigger>
          <Button>Select View</Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="View Options">
          <DropdownItem key="week">Week View</DropdownItem>
          <DropdownItem key="month">Month View</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </section>
  );
}
