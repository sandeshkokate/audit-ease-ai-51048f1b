import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255),
  company: z.string().trim().min(1, 'Company name is required').max(100),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  monthlyShipments: z.string().min(1, 'Please select monthly shipments'),
  message: z.string().trim().max(1000, 'Message must be under 1,000 characters').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const rateStructureSchema = z.record(
  z.string().min(1, 'Zone key required'),
  z.record(
    z.string().regex(/^\d+(\.\d+)?-\d+(\.\d+)?$/, 'Weight slab must be like "0-0.5"'),
    z.number({ invalid_type_error: 'Rate must be a number' }).nonnegative('Rate must be positive')
  )
).refine(obj => Object.keys(obj).length > 0, { message: 'At least one zone is required' });

export const rateCardFormSchema = z.object({
  courier_name: z.string().min(1, 'Courier name is required'),
  effective_from: z.string().min(1, 'Effective date is required'),
  effective_to: z.string().optional().or(z.literal('')),
  divisor: z.number().int().min(1, 'Divisor must be at least 1').max(50000),
  min_chargeable_weight: z.number().min(0).max(100),
  rto_percentage: z.number().min(0).max(100),
  rate_structure_json: z.string().min(1, 'Rate structure is required'),
});

export type RateCardFormData = z.infer<typeof rateCardFormSchema>;

export const creditNoteSchema = z.object({
  number: z.string().trim().min(1, 'Credit note number is required').max(50),
  amount: z.string().min(1, 'Amount is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be a positive number'),
  date: z.string().optional().or(z.literal('')),
});

export type CreditNoteData = z.infer<typeof creditNoteSchema>;
