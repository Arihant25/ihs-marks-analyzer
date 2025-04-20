import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Export the middleware function
export default withAuth(
  function middleware(req) {
    // If the user is authenticated and trying to access the homepage, 
    // redirect them to the dashboard
    if (req.nextUrl.pathname === "/") {
      if (req.nextauth.token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Run on all matched paths
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

// Update the matcher to include both the root path and dashboard paths
export const config = { 
  matcher: ["/", "/dashboard/:path*"] 
};