// app/api/swagger/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This function runs only on the server
export async function GET(request: NextRequest) {
  // Import the server-side module only here (it won't be bundled with client code)
  const { createSwaggerSpec } = await import('next-swagger-doc');
  
  try {
    const spec = createSwaggerSpec({
      apiFolder: 'app/api', // Path to your API routes
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Next.js API Documentation',
          version: '1.0',
          description: 'API documentation for Next.js application',
        },
        servers: [
          {
            url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [],
      },
    });

    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
}