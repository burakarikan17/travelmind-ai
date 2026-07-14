import { z } from 'zod'

export const tripFormSchema = z.object({
  destination: z.string().min(2).max(100),
  startDate: z.string().min(1),
  durationDays: z.number().int().min(1).max(30),
  budget: z.number().positive(),
  currency: z.string().default('TRY'),
  peopleCount: z.number().int().min(1).max(20),
  interests: z.array(z.string()).min(1),
})