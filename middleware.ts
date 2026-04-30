import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const { pathname } = req.nextUrl;

  // 🔓 PUBLIC routes (dostępne bez logowania)
  const publicRoutes = ["/logowanie"];

  if (publicRoutes.includes(pathname)) {
    // jeśli zalogowany → nie wpuszczaj na login
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 🔒 jeśli NIE zalogowany → redirect do login
  if (!token) {
    return NextResponse.redirect(new URL("/logowanie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // homepage
    "/transfery", // lista transferów
    "/rezerwacja", // dodawanie transferu
  ],
};
