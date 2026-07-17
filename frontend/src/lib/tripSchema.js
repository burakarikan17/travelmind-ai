import { z } from "zod";

export const tripFormSchema = z.object({
  destination: z
    .string()
    .min(2, "Şehir/ülke en az 2 karakter olmalı")
    .max(100, "Şehir/ülke en fazla 100 karakter olabilir"),

  startDate: z
    .string()
    .min(1, "Başlangıç tarihi seçilmelidir")
    .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
      message: "Başlangıç tarihi geçmişte olamaz",
    }),

  durationDays: z
    .number({ error: "Gün sayısı bir sayı olmalıdır" })
    .int("Gün sayısı tam sayı olmalıdır")
    .min(1, "En az 1 gün olmalı")
    .max(30, "En fazla 30 gün olabilir"),

  budget: z
    .number({ error: "Bütçe bir sayı olmalıdır" })
    .positive("Bütçe pozitif bir değer olmalı"),

  currency: z.string().default("TRY"),

  peopleCount: z
    .number({ error: "Kişi sayısı bir sayı olmalıdır" })
    .int()
    .min(1, "En az 1 kişi olmalı")
    .max(20, "En fazla 20 kişi olabilir"),

  interests: z.array(z.string()).min(1, "En az bir ilgi alanı seçmelisiniz"),
});
