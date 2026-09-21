import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email address').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address')
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(10, 'Valid reset token required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long')
});

export const DeleteAccountSchema = z.object({
  password: z.string().min(1, 'Password confirmation is required to delete account')
});

export const CreateAnalysisSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().optional(),
  planText: z.string().min(10, 'Plan description must be at least 10 characters'),
  location: z.string().optional(),
  duration: z.string().optional(),
  participants: z.number().int().positive().optional(),
  primarySDG: z.string().default('SDG 12 — Responsible Consumption and Production'),
  goals: z.array(z.string()).min(1, 'At least one sustainability goal is required'),
  categories: z.array(z.enum(['Waste', 'Water', 'Energy', 'Transportation', 'Materials', 'Consumption'])).min(1, 'Select at least one category to analyze'),
  forceDemo: z.boolean().optional()
});

export const WhatIfSchema = z.object({
  analysisId: z.string(),
  resolvedActionsCount: z.number().int().min(0)
});

export const ChatSchema = z.object({
  analysisId: z.string(),
  question: z.string().min(2, 'Question must be at least 2 characters')
});

export const FixPlanSchema = z.object({
  analysisId: z.string()
});
