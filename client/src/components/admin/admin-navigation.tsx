'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Orders', href: '/admin/orders' },
  {
    label: 'Cancellation Requests',
    href: '/admin/orders/cancellations',
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b bg-white p-4">
      {adminLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== '/admin' &&
            pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
