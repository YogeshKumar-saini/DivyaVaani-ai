'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string
    href: string
    icon?: React.ReactNode
  }[]
}

export function Sidebar({ className, items, ...props }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-100">DivyaVaani</h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar({ items }: SidebarProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base text-slate-100 hover:bg-white/10 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[300px] bg-slate-950/95 border-r border-cyan-200/15 backdrop-blur-xl">
        <div className="px-7 py-4 border-b border-cyan-200/10">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-semibold text-slate-100">DivyaVaani</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 px-4">
          <div className="flex flex-col space-y-2">
            {items.map(
              (item) =>
                item.href && (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-xl border px-4 py-3 text-sm transition-colors',
                      pathname === item.href
                        ? 'border-cyan-200/30 bg-cyan-300/15 text-slate-100'
                        : 'border-cyan-200/10 bg-slate-900/70 text-slate-300 hover:text-slate-100 hover:border-cyan-200/20'
                    )}
                  >
                    {item.title}
                  </Link>
                )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
