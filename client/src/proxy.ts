import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 1. Extraction du cookie
  // Le middleware a accès aux cookies de la requête HTTP
  const token = request.cookies.get('accessToken')?.value;

  // 2. Définition des chemins
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // 3. Logique de redirection
  // CAS A : L'utilisateur est connecté mais tente d'aller sur /login
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // CAS B : L'utilisateur n'est PAS connecté et tente d'aller sur une page privée
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CAS C : L'utilisateur n'est PAS connecté et tente d'aller sur une page admin
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Note: La vérification du rôle ADMIN se fait dans la page elle-même
  // car le middleware n'a pas accès au JWT_SECRET pour décoder et vérifier le rôle

  // Si tout est OK, on laisse passer la requête
  return NextResponse.next();
}

// 4. Le Matcher (Le filtre), défini les routes sur lesquelles le middleware s'active
export const config = {
  matcher: ['/login', '/register', '/dashboard/:path*', '/admin/:path*'],
}