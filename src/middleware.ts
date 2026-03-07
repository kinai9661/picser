import createMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { locales, defaultLocale } from '@/i18n/config';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/og/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname already starts with a locale
  const localePrefixPattern = new RegExp(`^/(${locales.join('|')})(/.*)?$`);
  const hasLocalePrefix = localePrefixPattern.test(pathname);
  
  // Redirect old routes without locale to default locale
  // This handles /api-docs -> /en/api-docs
  if (!hasLocalePrefix && pathname !== '/') {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Apply i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api/|_next|favicon.ico|icons/|og/).*)'],
};