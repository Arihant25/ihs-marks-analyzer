import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Export the middleware function
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If the user is authenticated and trying to access the homepage,
    // redirect them to the dashboard
    if (path === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Check if the user has a restricted roll number
    const restrictedRollNumber = token?.rollNumber &&
      (token.rollNumber.toString().startsWith("2023113") ||
        token.rollNumber.toString().startsWith("2023115"));

    // If user has a restricted roll number and is trying to access analysis or dashboard
    if (restrictedRollNumber && (path.startsWith("/analysis") || path.startsWith("/dashboard"))) {
      // Redirect to the custom not-found page
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Run on all matched paths
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/analysis")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

// Update the matcher to include both the root path, dashboard and analysis paths
export const config = {
  matcher: ["/", "/dashboard/:path*", "/analysis/:path*"],
};
