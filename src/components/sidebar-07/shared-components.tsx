// Simplified component implementations for sidebar-07
// These are minimal implementations - replace with full shadcn/ui components if needed

import * as React from "react"

// Avatar Component
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`}
      {...props}
    />
  )
}

export function AvatarImage({
  src,
  alt,
  className,
}: {
  src?: string
  alt?: string
  className?: string
}) {
  return <img src={src} alt={alt} className={`aspect-square h-full w-full ${className || ''}`} />
}

export function AvatarFallback({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className || ''}`}>
      {children}
    </div>
  )
}

// Collapsible Component
interface CollapsibleContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

export function Collapsible({
  children,
  defaultOpen = false,
  className,
  asChild,
  ...props
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  asChild?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className={className} data-state={open ? 'open' : 'closed'} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

export function CollapsibleTrigger({
  children,
  asChild = false,
  ...props
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(CollapsibleContext)
  if (!context) return <div {...props}>{children}</div>

  const handleClick = () => {
    context.setOpen(!context.open)
  }

  // Clone the child if asChild is true
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      'data-state': context.open ? 'open' : 'closed',
      ...props,
    })
  }

  return (
    <div onClick={handleClick} data-state={context.open ? 'open' : 'closed'} {...props}>
      {children}
    </div>
  )
}

export function CollapsibleContent({ children }: { children: React.ReactNode }) {
  const context = React.useContext(CollapsibleContext)
  if (!context) return null

  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        context.open ? 'opacity-100' : 'opacity-0 h-0'
      }`}
      data-state={context.open ? 'open' : 'closed'}
    >
      {context.open && <div>{children}</div>}
    </div>
  )
}

// DropdownMenu Component
interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative w-full">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    context?.setOpen(!context.open)
  }

  // Clone the child if asChild is true  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      'data-state': context?.open ? 'open' : 'closed',
    })
  }

  return <div onClick={handleClick} data-state={context?.open ? 'open' : 'closed'}>{children}</div>
}

export function DropdownMenuContent({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 4,
}: {
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const context = React.useContext(DropdownMenuContext)

  if (!context?.open) return null

  // Calculate position based on side and align
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "left-0" : "top-0",
    center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
  }

  return (
    <div
      className={`absolute z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${positionClasses[side]} ${alignClasses[align]} ${className || ''}`}
      style={{ marginTop: side === "bottom" ? `${sideOffset}px` : undefined }}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${className || ''}`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`px-2 py-1.5 text-sm font-semibold ${className || ''}`}>{children}</div>
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={`-mx-1 my-1 h-px bg-muted ${className || ''}`} />
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DropdownMenuShortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest opacity-60">{children}</span>
}
