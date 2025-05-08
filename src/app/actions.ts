"use server";

import { parseResume as parseResumeFlow, type ParseResumeInput, type ParseResumeOutput } from '@/ai/flows/resume-parsing';
import { generateCoverLetter as generateCoverLetterFlow, type CoverLetterInput, type CoverLetterOutput } from '@/ai/flows/cover-letter-generation';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase'; // Assuming admin SDK for server-side auth check if needed, or rely on client passing uid
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';


export async function handleResumeUpload(resumeDataUri: string): Promise<ParseResumeOutput | { error: string }> {
  try {
    const result = await parseResumeFlow({ resumeDataUri });
    return result;
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    return { error: error.message || "Failed to parse resume." };
  }
}

export async function handleGenerateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput | { error: string }> {
  try {
    const result = await generateCoverLetterFlow(input);
    return result;
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    return { error: error.message || "Failed to generate cover letter." };
  }
}

// Schema for resume data to be stored in Firestore
const StoredResumeDataSchema = z.object({
  userId: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.string()),
  education: z.array(z.string()),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});
type StoredResumeData = z.infer<typeof StoredResumeDataSchema>;


export async function saveParsedResume(userId: string, data: ParseResumeOutput): Promise<{ id: string } | { error: string }> {
  if (!userId) return { error: "User not authenticated." };
  try {
    const resumeRef = doc(collection(db, "users", userId, "resumes"), "latest"); // Always use 'latest' for this simplified version
    const resumeData: StoredResumeData = {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(resumeRef, resumeData);
    return { id: resumeRef.id };
  } catch (error: any) {
    console.error("Error saving resume data:", error);
    return { error: error.message || "Failed to save resume data." };
  }
}

export async function getLatestUserResume(userId: string): Promise<ParseResumeOutput | null | { error: string }> {
  if (!userId) return { error: "User not authenticated." };
  try {
    const resumeRef = doc(collection(db, "users", userId, "resumes"), "latest");
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
      // Validate data with Zod before returning, omitting userId and timestamps for ParseResumeOutput compatibility
      const data = docSnap.data();
      return {
        summary: data.summary,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user resume:", error);
    return { error: error.message || "Failed to fetch user resume." };
  }
}


// Schema for cover letter data to be stored in Firestore
const StoredCoverLetterDataSchema = z.object({
  userId: z.string(),
  jobDescription: z.string(),
  companyName: z.string(),
  jobTitle: z.string(),
  resumeSummary: z.string(), // The summary used for generation
  coverLetter: z.string(), // The generated cover letter
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});
type StoredCoverLetterData = z.infer<typeof StoredCoverLetterDataSchema>;

export async function saveGeneratedCoverLetter(userId: string, input: CoverLetterInput, coverLetterText: string): Promise<{ id: string } | { error: string }> {
  if (!userId) return { error: "User not authenticated." };
  try {
    // For simplicity, storing only the latest. A real app would use unique IDs.
    const coverLetterRef = doc(collection(db, "users", userId, "coverLetters"), "latest");
    const coverLetterData: StoredCoverLetterData = {
      ...input,
      userId,
      coverLetter: coverLetterText,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(coverLetterRef, coverLetterData);
    return { id: coverLetterRef.id };
  } catch (error: any) {
    console.error("Error saving cover letter:", error);
    return { error: error.message || "Failed to save cover letter data." };
  }
}

export async function getLatestUserCoverLetter(userId: string): Promise<(CoverLetterInput & { coverLetter: string }) | null | { error: string }> {
   if (!userId) return { error: "User not authenticated." };
  try {
    const coverLetterRef = doc(collection(db, "users", userId, "coverLetters"), "latest");
    const docSnap = await getDoc(coverLetterRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        resumeSummary: data.resumeSummary,
        coverLetter: data.coverLetter,
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user cover letter:", error);
    return { error: error.message || "Failed to fetch user cover letter." };
  }
}
