import { describe, test, expect } from 'vitest'
import { generateId, truncate, buildGenerationPrompt, formatEpisodeOutline } from 'shared/utils'
import { generationRequestSchema } from 'shared'
import type { EpisodeOutline } from 'shared/types'

describe('generateId', () => {
  test('returns non-empty string', () => {
    const id = generateId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  test('returns unique values on successive calls', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})

describe('truncate', () => {
  test('cuts text correctly when longer than maxLen', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  test('returns full text when within maxLen', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  test('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  test('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  test('trims trailing whitespace before ellipsis', () => {
    expect(truncate('hello world foo', 11)).toBe('hello world…')
  })
})

describe('generationRequestSchema', () => {
  test('validates valid genres', () => {
    const valid = generationRequestSchema.parse({
      genres: ['ceo', 'sweet_romance'],
    })
    expect(valid.genres).toHaveLength(2)
  })

  test('rejects empty genres array', () => {
    expect(() => generationRequestSchema.parse({ genres: [] })).toThrow()
  })

  test('rejects more than 3 genres', () => {
    expect(() =>
      generationRequestSchema.parse({
        genres: ['ceo', 'time_travel', 'sweet_romance', 'xianxia'],
      })
    ).toThrow()
  })

  test('applies default values', () => {
    const result = generationRequestSchema.parse({
      genres: ['ceo'],
    })
    expect(result.episodeCount).toBe(50)
    expect(result.generationType).toBe('outline')
    expect(result.locale).toBe('zh-CN')
  })

  test('rejects invalid genre', () => {
    expect(() =>
      generationRequestSchema.parse({
        genres: ['invalid_genre'],
      })
    ).toThrow()
  })
})

describe('buildGenerationPrompt', () => {
  test('returns a string', () => {
    const prompt = buildGenerationPrompt({
      genres: ['ceo', 'time_travel'],
      episodeCount: 50,
      locale: 'zh-CN',
    })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(100)
  })

  test('includes genre names in the prompt', () => {
    const prompt = buildGenerationPrompt({
      genres: ['ceo', 'time_travel'],
      episodeCount: 50,
      locale: 'zh-CN',
    })
    expect(prompt).toContain('ceo')
    expect(prompt).toContain('time_travel')
  })

  test('includes episode count in the prompt', () => {
    const prompt = buildGenerationPrompt({
      genres: ['fantasy'],
      episodeCount: 80,
      locale: 'en',
    })
    expect(prompt).toContain('80')
  })

  test('generates Chinese prompt for zh-CN', () => {
    const prompt = buildGenerationPrompt({
      genres: ['ceo'],
      episodeCount: 50,
      locale: 'zh-CN',
    })
    expect(prompt).toContain('短剧剧本')
  })

  test('generates English prompt for en', () => {
    const prompt = buildGenerationPrompt({
      genres: ['ceo'],
      episodeCount: 50,
      locale: 'en',
    })
    expect(prompt).toContain('short drama')
  })
})

describe('formatEpisodeOutline', () => {
  const episode: EpisodeOutline = {
    episode: 1,
    title: 'Test Episode',
    synopsis: 'A test synopsis for the episode',
    scenes: [
      {
        title: 'Scene 1',
        location: 'Office',
        characters: [],
        description: 'Opening scene description',
        keyDialogue: ['Hello world'],
        duration: '3min',
      },
    ],
    hook: 'What happens next?',
  }

  test('returns formatted text for zh-CN', () => {
    const result = formatEpisodeOutline(episode, 'zh-CN')
    expect(result).toContain('第 1 集')
    expect(result).toContain('Test Episode')
    expect(result).toContain('Office')
  })

  test('returns formatted text for en', () => {
    const result = formatEpisodeOutline(episode, 'en')
    expect(result).toContain('Episode 1')
    expect(result).toContain('Test Episode')
    expect(result).toContain('Office')
  })

  test('includes scene details', () => {
    const result = formatEpisodeOutline(episode, 'en')
    expect(result).toContain('Scene 1')
    expect(result).toContain('3min')
    expect(result).toContain('Hello world')
  })
})

import { buildUserPrompt } from 'shared'
import { formatCharacter, formatScriptPreview, generateShareText } from 'shared/utils/format'
import type { Character, EpisodeOutline, GenerationResponse } from 'shared'

describe('buildUserPrompt', () => {
  it('returns a string for outline generation', () => {
    const result = buildUserPrompt({ genres: ['ceo', 'time_travel'], episodeCount: 50, generationType: 'outline' })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(50)
  })

  it('returns a string for full_script generation', () => {
    const result = buildUserPrompt({ genres: ['sweet_romance'], episodeCount: 30, generationType: 'full_script' })
    expect(typeof result).toBe('string')
  })

  it('includes additional instructions when provided', () => {
    const result = buildUserPrompt({ 
      genres: ['ceo'], 
      episodeCount: 50, 
      generationType: 'outline',
      additionalInstructions: '加一些搞笑元素'
    })
    expect(result).toContain('搞笑元素')
  })
})

describe('formatCharacter', () => {
  it('formats a character in Chinese', () => {
    const char: Character = {
      name: '李总',
      age: '35',
      personality: ['霸气', '温柔'],
      background: '跨国集团总裁',
      arc: '从冷酷到温暖',
      role: 'protagonist',
      relationships: [{ name: '小王', relation: '助理' }],
    }
    const result = formatCharacter(char, 'zh-CN')
    expect(result).toContain('李总')
    expect(result).toContain('主角')
  })

  it('formats a character in English', () => {
    const char: Character = {
      name: 'Mr. Li',
      age: '35',
      personality: ['Domineering', 'Gentle'],
      background: 'CEO of multinational corporation',
      arc: 'From cold to warm',
      role: 'antagonist',
      relationships: [],
    }
    const result = formatCharacter(char, 'en')
    expect(result).toContain('Mr. Li')
    expect(result).toContain('Antagonist')
  })
})

describe('formatScriptPreview', () => {
  it('formats episode preview', () => {
    const episodes: EpisodeOutline[] = [
      {
        episode: 1,
        title: 'First Meeting',
        synopsis: 'They meet for the first time',
        scenes: [{ title: 'Office', location: 'Office building', characters: [], description: 'Meeting room', keyDialogue: ['Hello'], duration: '3min' }],
        hook: 'Who is she?'
      }
    ]
    const result = formatScriptPreview(episodes, 'en')
    expect(result).toContain('First Meeting')
    expect(result).toContain('Episode 1')
  })
})

describe('generateShareText', () => {
  it('generates share text from response', () => {
    const response: GenerationResponse = {
      title: '霸道总裁爱上我',
      premise: '一段跨越阶层的爱情故事',
      characters: [],
      episodes: [{ episode: 1, title: '相遇', synopsis: '他们相遇了', scenes: [], hook: '?' }],
      characterArcs: [],
    }
    const result = generateShareText(response, 'zh-CN')
    expect(result).toContain('霸道总裁爱上我')
  })
})

describe('Zod validation edge cases', () => {
  it('rejects empty genres', () => {
    expect(() => generationRequestSchema.parse({ genres: [] })).toThrow()
  })

  it('rejects more than 3 genres', () => {
    expect(() => generationRequestSchema.parse({ 
      genres: ['ceo', 'time_travel', 'sweet_romance', 'xianxia'] 
    })).toThrow()
  })

  it('rejects invalid genre', () => {
    expect(() => generationRequestSchema.parse({ genres: ['invalid_genre'] })).toThrow()
  })

  it('rejects additional instructions longer than 500 chars', () => {
    expect(() => generationRequestSchema.parse({ 
      genres: ['ceo'], 
      additionalInstructions: 'x'.repeat(501) 
    })).toThrow()
  })

  it('accepts valid minimal input', () => {
    const result = generationRequestSchema.parse({ genres: ['ceo'] })
    expect(result.genres).toEqual(['ceo'])
    expect(result.episodeCount).toBe(50)  // default
    expect(result.generationType).toBe('outline')  // default
    expect(result.locale).toBe('zh-CN')  // default
  })

  it('accepts complete valid input', () => {
    const result = generationRequestSchema.parse({
      genres: ['ceo', 'time_travel'],
      episodeCount: 100,
      generationType: 'full_script',
      locale: 'en',
      additionalInstructions: 'Make it funny',
    })
    expect(result.genres).toHaveLength(2)
    expect(result.episodeCount).toBe(100)
    expect(result.generationType).toBe('full_script')
  })
})