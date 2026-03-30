import { z } from "zod";

export const ExperienceSchema = z.object({
  period: z.string(),
  company: z.string(),
  position: z.string(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  period: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
});

export const EducationSchema = z.object({
  degree: z.string(),
  school: z.string(),
  major: z.string().optional(),
  status: z.string().optional(), // 졸업, 수료 등
});

export const CustomSectionSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

export const InstructorDataSchema = z.object({
  name: z.string(),
  title: z.string(), // 전문 분야 요약 (영문 권장)
  summary: z.string(),
  profileImageUrl: z.string().optional(),
  education: z.array(EducationSchema),
  experiences: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema).optional(),
  exhibitions: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  lectureHistory: z.array(z.string()).optional(),
  customSections: z.array(CustomSectionSchema).optional(),
});

export type InstructorData = z.infer<typeof InstructorDataSchema>;
