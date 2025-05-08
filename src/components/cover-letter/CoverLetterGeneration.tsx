"use client";

import React, { useState, useEffect } from 'react';
import type { ParseResumeOutput } from '@/ai/flows/resume-parsing';
import type { CoverLetterInput } from '@/ai/flows/cover-letter-generation';
import { handleGenerateCoverLetter, saveGeneratedCoverLetter, getLatestUserCoverLetter } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/icons/Spinner';
import { useToast } from '@/hooks/use-toast';
import { MailPlus, Edit3, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CoverLetterGenerationProps {
  resumeData: ParseResumeOutput | null;
}

const CoverLetterGeneration: React.FC<CoverLetterGenerationProps> = ({ resumeData }) => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [editableLetter, setEditableLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetchCoverLetter = async () => {
      // Do not set loading here, as it may override resume loading
      const result = await getLatestUserCoverLetter(user.uid);
      if (result && !('error' in result)) {
        setJobTitle(result.jobTitle);
        setCompanyName(result.companyName);
        setJobDescription(result.jobDescription);
        setGeneratedLetter(result.coverLetter);
        setEditableLetter(result.coverLetter);
      } else if (result && 'error' in result) {
        // Do not show error if no prior cover letter found
        if(result.error !== "Failed to fetch user cover letter.") { // a bit hacky
             console.warn("Error fetching cover letter:", result.error);
        }
      }
    };
    fetchCoverLetter();
  }, [user]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeData?.summary) {
      toast({ title: 'Resume Summary Missing', description: 'Please parse your resume first to provide a summary.', variant: 'destructive' });
      return;
    }
    if (!jobTitle || !companyName || !jobDescription) {
      toast({ title: 'Missing Information', description: 'Please fill in Job Title, Company Name, and Job Description.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    const coverLetterInput: CoverLetterInput = {
      jobTitle,
      companyName,
      jobDescription,
      resumeSummary: resumeData.summary,
    };

    try {
      const result = await handleGenerateCoverLetter(coverLetterInput);
      if ('error' in result) {
        throw new Error(result.error);
      }
      setGeneratedLetter(result.coverLetter);
      setEditableLetter(result.coverLetter);
      toast({ title: 'Cover Letter Generated', description: 'Your cover letter has been drafted.' });
      if (user) {
        await saveGeneratedCoverLetter(user.uid, coverLetterInput, result.coverLetter);
        toast({ title: 'Cover Letter Saved', description: 'Your new cover letter has been saved.' });
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during generation.');
      toast({ title: 'Generation Failed', description: e.message, variant: 'destructive' });
      setGeneratedLetter(null);
      setEditableLetter(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleEditMode = () => {
    if (isEditing && editableLetter && generatedLetter) {
       setGeneratedLetter(editableLetter);
       if (user && resumeData?.summary) {
         const coverLetterInput: CoverLetterInput = { jobTitle, companyName, jobDescription, resumeSummary: resumeData.summary };
         saveGeneratedCoverLetter(user.uid, coverLetterInput, editableLetter).then(res => {
          if ('id' in res) {
            toast({ title: 'Changes Saved', description: 'Your cover letter edits have been saved.' });
          } else {
             toast({ title: 'Save Failed', description: res.error, variant: 'destructive' });
          }
        });
       }
    } else if (!isEditing && generatedLetter) {
       setEditableLetter(generatedLetter);
    }
    setIsEditing(!isEditing);
  };

  if (!resumeData) {
    return (
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MailPlus className="h-6 w-6 text-primary" />
            <CardTitle>Cover Letter Generation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please upload and parse your resume first to enable cover letter generation.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MailPlus className="h-6 w-6 text-primary" />
            <CardTitle>Cover Letter Generation</CardTitle>
          </div>
           {generatedLetter && (
            <Button variant="outline" size="sm" onClick={toggleEditMode}>
              {isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Edits</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Letter</>}
            </Button>
          )}
        </div>
        <CardDescription>Provide job details to generate a tailored cover letter using your resume summary.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Acme Corp" required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || !resumeData?.summary} className="w-full md:w-auto min-w-[180px]">
            {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <MailPlus className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating...' : 'Generate Cover Letter'}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !generatedLetter && (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
              <Spinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground">Drafting your cover letter, please wait...</p>
            </div>
          )}

          {generatedLetter && (
            <div className="space-y-2 pt-4 border-t mt-6">
              <Label htmlFor="generated-letter" className="text-base font-semibold">Generated Cover Letter</Label>
               {isEditing ? (
                  <Textarea
                    id="editable-letter"
                    value={editableLetter || ''}
                    onChange={(e) => setEditableLetter(e.target.value)}
                    rows={15}
                    className="bg-secondary border-primary/50 focus:bg-background"
                  />
                ) : (
                  <div className="p-3 min-h-[300px] rounded-md border bg-muted whitespace-pre-wrap text-sm">
                    {generatedLetter}
                  </div>
                )}
            </div>
          )}
        </CardContent>
        {generatedLetter && isEditing && (
            <CardFooter>
                 <Button onClick={toggleEditMode} className="w-full">
                    <Save className="mr-2 h-4 w-4" /> Save All Changes
                </Button>
            </CardFooter>
        )}
      </form>
    </Card>
  );
};

export default CoverLetterGeneration;
