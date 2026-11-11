import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Check, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { cn } from "@design-templates/utilities";
export { ThemeProvider, useTheme } from "./theme";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; size?: "default" | "sm" | "icon"; loading?: boolean };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "default", loading, disabled, children, ...props }, ref) => <button ref={ref} className={cn("ui-button", `ui-button-${variant}`, size !== "default" && `ui-button-${size}`, className)} disabled={disabled || loading} {...props}>{loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{children}</button>);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn("ui-input", className)} {...props} />);
Input.displayName = "Input";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn("ui-input min-h-24 resize-y", className)} {...props} />);
Textarea.displayName = "Textarea";
export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label className={cn("ui-label", className)} {...props} />;

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => <SelectPrimitive.Trigger ref={ref} className={cn("ui-select-trigger", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown className="h-4 w-4 opacity-60" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>);
SelectTrigger.displayName = "SelectTrigger";
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => <SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} position={position} className={cn("ui-menu-content max-h-72 overflow-auto", className)} {...props}><SelectPrimitive.ScrollUpButton className="flex justify-center"><ChevronUp className="h-4 w-4" /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="flex justify-center"><ChevronDown className="h-4 w-4" /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>);
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => <SelectPrimitive.Item ref={ref} className={cn("ui-menu-item", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="ml-auto"><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>);
SelectItem.displayName = "SelectItem";

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(({ className, ...props }, ref) => <CheckboxPrimitive.Root ref={ref} className={cn("flex h-4 w-4 items-center justify-center rounded border border-input bg-background text-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}><CheckboxPrimitive.Indicator><Check className="h-3 w-3" /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>);
Checkbox.displayName = "Checkbox";
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(({ className, ...props }, ref) => <SwitchPrimitive.Root ref={ref} className={cn("relative h-6 w-11 rounded-full bg-muted transition-colors data-[state=checked]:bg-primary", className)} {...props}><SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" /></SwitchPrimitive.Root>);
Switch.displayName = "Switch";

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("ui-card", className)} {...props} />;
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-base font-bold tracking-tight", className)} {...props} />;
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-xs leading-5 text-muted-foreground", className)} {...props} />;
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-5 pb-5", className)} {...props} />;
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex items-center p-5 pt-0", className)} {...props} />;
export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={cn("ui-badge", className)} {...props} />;
export const Sidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => <aside ref={ref} className={cn(className)} {...props} />);
Sidebar.displayName = "Sidebar";
export const Topbar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => <header ref={ref} className={cn(className)} {...props} />);
Topbar.displayName = "Topbar";
export function Breadcrumb({ items, className }: { items: Array<{ label: string; href?: string }>; className?: string }) {
  return <nav aria-label="Breadcrumb" className={className}><ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <a href={item.href} className="hover:text-foreground">{item.label}</a> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}
export function ResponsiveNavigation({ items, activeId, onSelect, label = "Open navigation", trigger }: { items: Array<{ id: string; label: string; icon?: React.ReactNode }>; activeId: string; onSelect: (id: string) => void; label?: string; trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="responsive-nav-trigger" size="icon" variant="ghost" aria-label={label}>{trigger}</Button></DialogTrigger><DialogContent className="ui-responsive-navigation"><DialogHeader><DialogTitle>Navigation</DialogTitle><DialogDescription>Choose a workspace section.</DialogDescription></DialogHeader><nav aria-label="Responsive navigation" className="grid gap-1">{items.map((item) => <Button key={item.id} variant={item.id === activeId ? "secondary" : "ghost"} className="justify-start" aria-current={item.id === activeId ? "page" : undefined} onClick={() => { onSelect(item.id); setOpen(false); }}>{item.icon}{item.label}</Button>)}</nav></DialogContent></Dialog>;
}

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => <DialogPrimitive.Portal><DialogPrimitive.Overlay className="ui-overlay" /><DialogPrimitive.Content ref={ref} className={cn("ui-dialog", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close dialog">×</DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>);
DialogContent.displayName = "DialogContent";
export const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) => <DialogPrimitive.Title className={cn("ui-dialog-title", className)} {...props} />;
export const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) => <DialogPrimitive.Description className={cn("ui-dialog-description", className)} {...props} />;
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mb-5", className)} {...props} />;
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row", className)} {...props} />;
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({ className, children, ...props }, ref) => <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay className="ui-overlay" /><AlertDialogPrimitive.Content ref={ref} className={cn("ui-dialog", className)} {...props}>{children}</AlertDialogPrimitive.Content></AlertDialogPrimitive.Portal>);
AlertDialogContent.displayName = "AlertDialogContent";
export const AlertDialogTitle = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) => <AlertDialogPrimitive.Title className={cn("ui-dialog-title", className)} {...props} />;
export const AlertDialogDescription = ({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) => <AlertDialogPrimitive.Description className={cn("ui-dialog-description", className)} {...props} />;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void }) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent aria-describedby="confirm-dialog-description"><DialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription id="confirm-dialog-description">{description}</AlertDialogDescription></DialogHeader><DialogFooter><AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel><AlertDialogAction asChild><Button variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>{confirmLabel}</Button></AlertDialogAction></DialogFooter></AlertDialogContent></AlertDialog>;
}

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({ className, sideOffset = 6, ...props }, ref) => <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content ref={ref} className={cn("ui-menu-content", className)} sideOffset={sideOffset} {...props} /></DropdownMenuPrimitive.Portal>);
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>>(({ className, ...props }, ref) => <DropdownMenuPrimitive.Item ref={ref} className={cn("ui-menu-item", className)} {...props} />);
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuLabel = ({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => <DropdownMenuPrimitive.Label className={cn("ui-menu-label", className)} {...props} />;

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn("ui-tabs-list", className)} {...props} />);
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("ui-tab", className)} {...props} />);
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = TabsPrimitive.Content;

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({ className, sideOffset = 5, ...props }, ref) => <TooltipPrimitive.Portal><TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-[70] rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow", className)} {...props} /></TooltipPrimitive.Portal>);
TooltipContent.displayName = "TooltipContent";

export function ToastProvider({ children }: { children: React.ReactNode }) { return <ToastPrimitive.Provider swipeDirection="right">{children}<ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 outline-none" /></ToastPrimitive.Provider>; }
export function Toast({ title, description, open, onOpenChange }: { title: string; description?: string; open: boolean; onOpenChange: (open: boolean) => void }) { return <ToastPrimitive.Root open={open} onOpenChange={onOpenChange} className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xl data-[state=open]:animate-in"><ToastPrimitive.Title className="text-sm font-bold">{title}</ToastPrimitive.Title>{description && <ToastPrimitive.Description className="mt-1 text-xs text-muted-foreground">{description}</ToastPrimitive.Description>}<ToastPrimitive.Close className="absolute right-3 top-3" aria-label="Dismiss">×</ToastPrimitive.Close></ToastPrimitive.Root>; }

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) { return <table className={cn("ui-table", className)} {...props} />; }
export const TableHead = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />;
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn("transition-colors hover:bg-muted/40", className)} {...props} />;
export const TableHeader = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} />;
export const TableCell = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...props} />;
export function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) { return <nav aria-label="Pagination" className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span className="text-xs text-muted-foreground">Page {page} of {pages}</span><Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button></nav>; }
export function Skeleton({ className }: { className?: string }) { return <div aria-hidden="true" className={cn("ui-skeleton", className)} />; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="ui-empty"><p className="font-bold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>; }
export function ErrorState({ title = "Something went wrong", description, onRetry }: { title?: string; description: string; onRetry?: () => void }) { return <div role="alert" className="ui-empty"><p className="font-bold text-destructive">{title}</p><p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>{onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}</div>; }
