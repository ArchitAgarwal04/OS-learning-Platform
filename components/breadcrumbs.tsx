import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href: string
  active?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      <ChevronRight className="h-4 w-4" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <Link
            href={item.href}
            className={`hover:text-foreground transition-colors ${item.active ? "text-foreground font-medium" : ""}`}
          >
            {item.label}
          </Link>
          {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
        </div>
      ))}
    </nav>
  )
}
