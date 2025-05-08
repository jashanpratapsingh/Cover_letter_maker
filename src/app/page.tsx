"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ResumeAnalysis from '@/components/resume/ResumeAnalysis';
import CoverLetterGeneration from '@/components/cover-letter/CoverLetterGeneration';
import type { ParseResumeOutput } from '@/ai/flows/resume-parsing';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import Spinner from '@/components/icons/Spinner';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [currentResumeData, setCurrentResumeData] = useState<ParseResumeOutput | null>(null);

  const handleResumeUpdate = (resumeData: ParseResumeOutput | null) => {
    setCurrentResumeData(resumeData);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height)-6rem)]">
        <Spinner className="h-12 w-12 text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your ResumeMate...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-var(--header-height)-6rem)] p-6 rounded-lg bg-card shadow-xl">
        <Image src="https://picsum.photos/seed/resumemate/400/250" alt="Professional workspace" width={400} height={250} className="rounded-lg mb-8 shadow-md" data-ai-hint="workspace desk" />
        <h2 className="text-3xl font-semibold mb-4 text-primary">Welcome to ResumeMate!</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Unlock the power of AI to analyze your resume and craft compelling cover letters. Sign in to get started.
        </p>
        <Button onClick={signInWithGoogle} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
          <LogIn className="mr-2 h-5 w-5" />
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ResumeAnalysis onResumeUpdate={handleResumeUpdate} />
      <CoverLetterGeneration resumeData={currentResumeData} />
    </div>
  );
}
