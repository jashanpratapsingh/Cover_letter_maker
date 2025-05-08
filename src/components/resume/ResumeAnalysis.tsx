"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { ParseResumeOutput } from '@/ai/flows/resume-parsing';
import { handleResumeUpload, saveParsedResume, getLatestUserResume } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/icons/Spinner';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Edit3, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResumeAnalysisProps {
  onResumeUpdate: (resumeData: ParseResumeOutput | null) => void;
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ onResumeUpdate }) => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParseResumeOutput | null>(null);
  const [editableData, setEditableData] = useState<ParseResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchResume = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    const result = await getLatestUserResume(user.uid);
    if (result && !('error' in result)) {
      setParsedData(result);
      setEditableData(result);
      onResumeUpdate(result);
    } else if (result && 'error' in result) {
      // Not showing an error if no resume found, just parsedData remains null
      if(result.error !== "Failed to fetch user resume."){ // a bit hacky, but firestore might not have data
         console.warn("Error fetching resume:", result.error);
      }
    }
    setIsLoading(false);
  }, [user, onResumeUpdate]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setResumeFile(null);
      setError('Please upload a PDF file.');
      toast({ title: 'Invalid File Type', description: 'Please upload a PDF file.', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      toast({ title: 'No File Selected', description: 'Please select a resume PDF to upload.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(resumeFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await handleResumeUpload(base64data);
        if ('error' in result) {
          throw new Error(result.error);
        }
        setParsedData(result);
        setEditableData(result);
        onResumeUpdate(result);
        toast({ title: 'Resume Parsed', description: 'Your resume has been analyzed successfully.' });
        if (user) {
          await saveParsedResume(user.uid, result);
          toast({ title: 'Resume Saved', description: 'Your parsed resume has been saved.' });
        }
      };
      reader.onerror = () => {
         throw new Error('Failed to read file.');
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during parsing.');
      toast({ title: 'Parsing Failed', description: e.message, variant: 'destructive' });
      setParsedData(null);
      setEditableData(null);
      onResumeUpdate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field: keyof ParseResumeOutput, value: string | string[]) => {
    if (editableData) {
      setEditableData({ ...editableData, [field]: value });
    }
  };

  const toggleEditMode = () => {
    if (isEditing && editableData && parsedData) { // Saving changes
      // TODO: Add a confirmation or a specific save button action if needed.
      // For now, changes are "saved" to local state and propagated up.
      setParsedData(editableData); // Update "source of truth" for cover letter gen
      onResumeUpdate(editableData);
      if (user) {
        saveParsedResume(user.uid, editableData).then(res => {
          if ('id' in res) {
            toast({ title: 'Changes Saved', description: 'Your resume edits have been saved.' });
          } else {
             toast({ title: 'Save Failed', description: res.error, variant: 'destructive' });
          }
        });
      }
    } else if (!isEditing && parsedData) {
      setEditableData(JSON.parse(JSON.stringify(parsedData))); // Deep copy for editing
    }
    setIsEditing(!isEditing);
  };
  
  const renderEditableField = (label: string, field: keyof ParseResumeOutput, type: 'textarea' | 'arrayarea' = 'textarea') => {
    if (!editableData) return null;
    
    const value = editableData[field];

    if (type === 'arrayarea') {
      return (
        <div className="space-y-1">
          <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
          {isEditing ? (
            <Textarea
              id={field}
              value={Array.isArray(value) ? value.join('\n') : ''}
              onChange={(e) => handleEditChange(field, e.target.value.split('\n'))}
              rows={5}
              className="bg-secondary border-primary/50 focus:bg-background"
            />
          ) : (
            <div className="p-3 min-h-[100px] rounded-md border bg-muted whitespace-pre-wrap text-sm">
              {Array.isArray(value) ? value.map((item, idx) => <p key={idx}>- {item}</p>) : 'Not available'}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
        {isEditing ? (
          <Textarea
            id={field}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleEditChange(field, e.target.value)}
            rows={field === 'summary' ? 8 : 5}
            className="bg-secondary border-primary/50 focus:bg-background"
          />
        ) : (
          <div className="p-3 min-h-[100px] rounded-md border bg-muted whitespace-pre-wrap text-sm">
            {typeof value === 'string' && value.trim() ? value : 'Not available'}
          </div>
        )}
      </div>
    );
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Resume Analysis</CardTitle>
          </div>
          {parsedData && (
            <Button variant="outline" size="sm" onClick={toggleEditMode}>
              {isEditing ? <><Save className="mr-2 h-4 w-4" /> Save Edits</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Resume Data</>}
            </Button>
          )}
        </div>
        <CardDescription>Upload your resume (PDF) to extract key information and prepare it for cover letter generation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="text-base font-semibold">Upload Resume PDF</Label>
          <div className="flex items-center gap-3">
            <Input id="resume-upload" type="file" accept=".pdf" onChange={handleFileChange} className="max-w-sm file:text-primary file:font-semibold"/>
            <Button onClick={handleSubmit} disabled={!resumeFile || isLoading} className="min-w-[120px]">
              {isLoading && !parsedData ? <Spinner className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isLoading && !parsedData ? 'Parsing...' : 'Parse Resume'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading && !parsedData && (
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-muted-foreground">Analyzing your resume, please wait...</p>
          </div>
        )}

        {parsedData && (
          <div className="space-y-4 pt-4 border-t mt-6">
            {renderEditableField('Summary', 'summary')}
            {renderEditableField('Skills', 'skills', 'arrayarea')}
            {renderEditableField('Experience', 'experience', 'arrayarea')}
            {renderEditableField('Education', 'education', 'arrayarea')}
          </div>
        )}
      </CardContent>
      {parsedData && isEditing && (
        <CardFooter>
           <Button onClick={toggleEditMode} className="w-full">
              <Save className="mr-2 h-4 w-4" /> Save All Changes
            </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResumeAnalysis;
