import { z } from "zod";
export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name should have atleast two charcters"),
  email: z.string().email("Email is invalid"),
  phone: z.string(),
  service_name: z.string().optional(),
  query: z.string(),
});

export const AiGuideFormSchema = z.object({
  content: z.string(),
});

export const NeuraTextModeFormSchema = z.object({
  content: z.string(),
});

export const WaitingListSchema = z.object({
  full_name: z.string(),
  email: z.string().email("Email is invalid"),
  interestingInSubscription: z.boolean(),
  intrestedInUpdates: z.boolean(),
});

export const ConfigurationFormSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  user: z.string(),
  password: z.string(),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
});
