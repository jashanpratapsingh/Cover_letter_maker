'use server';
/**
 * @fileOverview Cover letter generation flow.
 *
 * This file defines a Genkit flow for generating a cover letter based on user-provided job description,
 * company name, job title, and the extracted information from their resume.
 *
 * @param {CoverLetterInput} input - The input parameters for cover letter generation.
 * @returns {Promise<CoverLetterOutput>} - A promise that resolves to the generated cover letter.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoverLetterInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full job description that will be used to tailor the cover letter.'),
  companyName: z.string().describe('The name of the company to address the cover letter to.'),
  jobTitle: z.string().describe('The job title for which the cover letter is being written.'),
  resumeSummary: z
    .string()
    .describe(
      'A summary of the resume, including skills and experience. This summary should be concise and highlight key qualifications.'
    ),
});

export type CoverLetterInput = z.infer<typeof CoverLetterInputSchema>;

const CoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter text.'),
});

export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput> {
  return coverLetterFlow(input);
}

const coverLetterPrompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: {schema: CoverLetterInputSchema},
  output: {schema: CoverLetterOutputSchema},
  prompt: `You are an expert cover letter writer. Use the information provided to generate a compelling cover letter.

  Company Name: {{{companyName}}}
  Job Title: {{{jobTitle}}}
  Job Description: {{{jobDescription}}}
  Resume Summary: {{{resumeSummary}}}

  Cover Letter:`,
});

const coverLetterFlow = ai.defineFlow(
  {
    name: 'coverLetterFlow',
    inputSchema: CoverLetterInputSchema,
    outputSchema: CoverLetterOutputSchema,
  },
  async input => {
    const {output} = await coverLetterPrompt(input);
    return output!;
  }
);
