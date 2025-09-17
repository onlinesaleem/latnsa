// app/api-doc/page.tsx
'use client';

import { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDoc() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const specData = await response.json();
        setSpec(specData);
      } catch (err) {
        setError('Failed to load API documentation. Please make sure your API routes are properly configured.');
        console.error('Error fetching Swagger spec:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading API Documentation</h2>
          <p className="text-gray-600 mt-2">Please wait while we load the interactive documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Documentation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Troubleshooting tips:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Make sure you have API routes defined in your app/api directory</li>
              <li>Check that your API routes are properly annotated with JSDoc comments</li>
              <li>Verify that the /api/swagger endpoint is working correctly</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Latnsa Health</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-gray-600 hover:text-green-600 transition-colors">Home</a>
            <a href="/about" className="text-gray-600 hover:text-green-600 transition-colors">About</a>
            <a href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
            <a href="/assessment" className="text-gray-600 hover:text-green-600 transition-colors">Assessment</a>
          </nav>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">API Documentation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Interactive documentation for all available API endpoints in the Latnsa Health Assessment System
          </p>
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Next.js API Documentation</h2>
          <p className="text-gray-600 mb-4">API documentation for Next.js application</p>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">Servers</h3>
            <div className="bg-gray-100 p-3 rounded-lg">
              <a href="http://localhost:3000/api" className="text-green-600 hover:underline">
                http://localhost:3000/api - Development server
              </a>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No operations defined in spec! This might be because you haven&apos;t defined any API routes or they aren&apos;t properly annotated with JSDoc comments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Swagger UI */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {spec ? (
            <SwaggerUI 
              spec={spec} 
              persistAuthorization={true}
              docExpansion="list"
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              Unable to load API documentation. Please check your configuration.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Latnsa Health. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
            <a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}