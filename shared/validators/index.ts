import { z } from 'zod'

export const dramaGenreSchema = z.enum([
  'ceo', 'time_travel', 'sweet_romance', 'xianxia',
  'suspense', 'urban', 'fantasy', 'rebirth',
  'school', 'ancient_costume'
])

export const generationTypeSchema = z.enum(['outline', 'scene', 'character', 'full_script'])
export const episodeCountSchema = z.number().int().min(0, '至少1集').max(200, '最多200集').default(10)
export const localeSchema = z.enum(['zh-CN', 'en'])

export const generationRequestSchema = z.object({
  genres: z.array(dramaGenreSchema).min(1, '至少选择一个题材').max(3, '最多选择3个题材'),
  episodeCount: episodeCountSchema.default(10),
  generationType: generationTypeSchema.default('outline'),
  locale: localeSchema.default('zh-CN'),
  additionalInstructions: z.string().max(500).optional(),
  autoEpisodeCount: z.boolean().optional().default(false),
})

export type GenerationRequestInput = z.infer<typeof generationRequestSchema>
