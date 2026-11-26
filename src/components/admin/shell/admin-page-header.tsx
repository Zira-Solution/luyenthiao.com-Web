import Link from 'next/link'

export interface AdminBreadcrumb {
  label: string
  href?: string
}

export interface AdminPageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: readonly AdminBreadcrumb[]
  actions?: React.ReactNode
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: AdminPageHeaderProps): React.ReactElement {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Đường dẫn" className="mb-1.5">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {isLast || !crumb.href ? (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className="font-medium text-slate-700"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="focus-visible:ring-brand-primary rounded transition-colors hover:text-slate-900 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {crumb.label}
                      </Link>
                    )}
                    {!isLast && (
                      <span aria-hidden="true" className="text-slate-400">
                        ›
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <h1 className="text-xl font-semibold tracking-tight break-words text-slate-900 sm:text-2xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
