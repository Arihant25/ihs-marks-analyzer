'use client'

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnimatedButton from "./AnimatedButton";

interface CasLoginProps {
  color?: 'lime' | 'blue' | 'orange';
}

export default function CasLogin({ color = 'lime' }: CasLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Handle the CAS redirect and ticket
  useEffect(() => {
    const ticket = searchParams.get('ticket');
    
    // If there's a ticket in the URL, process the CAS login
    if (ticket) {
      setIsLoading(true);
      
      // Use the current URL's origin + path without the query parameters as service
      const currentUrl = new URL(window.location.href);
      currentUrl.search = ''; // Remove query parameters
      const service = currentUrl.toString();
      
      // Call the NextAuth API with the ticket
      signIn('credentials', {
        ticket,
        service, // Pass the service URL to match what was sent to CAS
        redirect: true,
        callbackUrl: '/dashboard',
      }).catch((err) => {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      });
    }
  }, [searchParams, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Generate the service URL (the URL that CAS will redirect back to)
      const serviceUrl = new URL(window.location.origin);
      serviceUrl.pathname = '/';
      
      // Redirect to CAS login page
      window.location.href = `https://login.iiit.ac.in/cas/login?service=${encodeURIComponent(serviceUrl.toString())}`;
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="text-red-500 mb-4 text-sm">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center">
          <div className={`loader ${color === 'blue' ? 'loader-blue' : color === 'orange' ? 'loader-orange' : ''}`}></div>
        </div>
      ) : (
        <AnimatedButton 
          onClick={handleLogin}
          color={color}
          fullWidth
        >
          LOGIN_WITH_CAS()
        </AnimatedButton>
      )}
    </>
  );
}