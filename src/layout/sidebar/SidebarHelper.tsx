import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/utils/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSubmenu } from "@/components/ui/components/DropdownButton";

/**
 * Collapsible helpers leverage Radix primitives to guarantee
 * keyboard accessibility while keeping the data-state API the
 * sidebar expects.
 */
const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> & {
  ref?: React.Ref<HTMLDivElement>
}) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "grid overflow-hidden transition-all duration-200",
      "data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]",
      className,
    )}
    {...props}
  >
    <div className="overflow-hidden">{children}</div>
  </CollapsiblePrimitive.Content>
)

/**
 * Dropdown helpers re-export the UI kit primitives while
 * providing missing opinionated pieces (label/separator/group)
 * that match the design tokens documented in the UI README.
 */

const baseMenuPadding = "px-3 py-2";

const DropdownMenuLabel = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}) => (
  <div
    ref={ref}
    className={cn(
      baseMenuPadding,
      "label-medium-bold text-onSurface",
      className,
    )}
    role="presentation"
    {...props}
  />
)

const DropdownMenuSeparator = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}) => (
  <div
    ref={ref}
    className={cn("mx-3 my-1 h-px bg-onSurfaceVariant", className)}
    role="separator"
    {...props}
  />
)

const DropdownMenuGroup = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<HTMLDivElement>
}) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1", className)}
    role="group"
    {...props}
  />
)

export { Collapsible, CollapsibleContent, CollapsibleTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubmenu, DropdownMenuTrigger };
