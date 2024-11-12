import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, ArrowLeft } from 'lucide-react';

export default function PersonNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="w-full max-w-2xl px-4">
        <Card className="border-gray-800 bg-black text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-white">
              Person Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-300">
              The person you are looking for does not exist or has been removed.
            </p>

            <p className="text-lg text-gray-300">
              If you navigated here from a link on this site, please report the
              issue on our{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-blue-400 hover:text-blue-300"
                asChild
              >
                <a
                  href="https://github.com/Lagden-Development/lagden.dev/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>
              </Button>
              .
            </p>

            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <Link href="/people">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to All People
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <a
                  href="https://github.com/Lagden-Development/lagden.dev/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Report Issue
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
