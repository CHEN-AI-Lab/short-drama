/**
 * System prompt builders for AI drama generation.
 * Varies JSON output structure per generation type.
 */

export interface BuildGenerationPromptParams {
  genres: string[]
  episodeCount: number
  locale: string
  autoEpisodeCount?: boolean
  generationType: string
  startEpisode?: number
  existingSummary?: string
}

export function buildGenerationPrompt(params: BuildGenerationPromptParams): string {
  const { genres, episodeCount, locale, autoEpisodeCount, generationType, startEpisode, existingSummary } = params
  const isChinese = locale === 'zh-CN'
  const genreList = genres.join(', ')

  const epCountStr = autoEpisodeCount
    ? (isChinese ? '由AI根据题材和剧情需要决定' : 'decided by AI based on the story')
    : (isChinese ? `严格生成 ${episodeCount} 集` : `${episodeCount}`)

  // ── Per-type JSON structures ──
  const zhStructure: Record<string, string> = {
    outline: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    { "name": "角色名", "role": "主角/配角/反派" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）"
    }
  ]
}`,
    scene: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    { "name": "角色名", "age": 28, "personality": "性格描述", "background": "背景故事", "role": "主角/配角/反派" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）",
      "scenes": [
        { "location": "场景地点", "description": "场景描述", "duration": "时长", "characters": ["角色名"] }
      ]
    }
  ]
}`,
    character: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字）",
  "characters": [
    {
      "name": "角色名", "age": 28,
      "personality": "详细性格描述",
      "background": "完整的背景故事",
      "role": "主角/配角/反派",
      "relationship": "与其他角色的关系",
      "arc": "角色成长弧光"
    }
  ],
  "episodes": [
    { "episodeNumber": 1, "title": "第1集标题", "summary": "剧情概要" }
  ],
  "characterArcs": [
    { "characterId": "char_1", "arc": "成长弧光描述" }
  ]
}`,
    full_script: `{
  "title": "剧本标题",
  "premise": "核心设定（100-200字，包含世界观、故事背景和核心冲突）",
  "characters": [
    {
      "name": "角色名", "age": 28,
      "personality": "性格描述",
      "background": "背景故事",
      "role": "主角/配角/反派",
      "relationship": "与其他角色的关系"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "悬念钩子",
      "summary": "剧情概要（100-200字）",
      "scenes": [
        {
          "location": "场景地点",
          "description": "场景描述",
          "duration": "时长",
          "characters": ["角色名"],
          "dialogue": "完整对话内容"
        }
      ]
    }
  ],
  "characterArcs": [
    { "characterId": "char_1", "arc": "成长弧光描述" }
  ]
}`,
  }

  const enStructure: Record<string, string> = {
    outline: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    { "name": "Character name", "role": "protagonist/supporting/antagonist" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary (100-200 words)"
    }
  ]
}`,
    scene: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    { "name": "Character name", "age": 28, "personality": "Description", "background": "Background", "role": "protagonist/supporting/antagonist" }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary",
      "scenes": [
        { "location": "Location", "description": "Scene description", "duration": "Duration", "characters": ["Character names"] }
      ]
    }
  ]
}`,
    character: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    {
      "name": "Character name", "age": 28,
      "personality": "Detailed personality",
      "background": "Complete backstory",
      "role": "protagonist/supporting/antagonist",
      "relationship": "Relationships",
      "arc": "Character growth arc"
    }
  ],
  "episodes": [
    { "episodeNumber": 1, "title": "Episode 1 title", "summary": "Plot summary" }
  ],
  "characterArcs": [
    { "characterId": "char_1", "arc": "Growth arc description" }
  ]
}`,
    full_script: `{
  "title": "Script title",
  "premise": "Core premise (100-200 words)",
  "characters": [
    {
      "name": "Character name", "age": 28,
      "personality": "Description",
      "background": "Background story",
      "role": "protagonist/supporting/antagonist",
      "relationship": "Relationships"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Cliffhanger",
      "summary": "Plot summary",
      "scenes": [
        {
          "location": "Location",
          "description": "Scene description",
          "duration": "Duration",
          "characters": ["Character names"],
          "dialogue": "Full dialogue"
        }
      ]
    }
  ],
  "characterArcs": [
    { "characterId": "char_1", "arc": "Growth arc description" }
  ]
}`,
  }

  const typename: Record<string, string> = isChinese
    ? { outline: '分集大纲', scene: '场景拆分', character: '人物弧光', full_script: '完整剧本' }
    : { outline: 'Outline', scene: 'Scene Breakdown', character: 'Character Arc', full_script: 'Full Script' }

  const typedesc: Record<string, string> = isChinese
    ? {
        outline: '只需要每集的标题、悬念钩子和剧情概要，不要场景和对白',
        scene: '需要每集的场景拆分（地点、时长、角色），不需要对白',
        character: '重点刻画角色性格、背景、关系和成长弧光，集数概要即可',
        full_script: '完整的剧本，包含所有场景的详细对白',
      }
    : {
        outline: 'Only episode titles, hooks and summaries — no scenes or dialogue',
        scene: 'Include scene breakdowns (location, duration, characters) — no dialogue',
        character: 'Focus on character profiles, backgrounds, relationships and arcs',
        full_script: 'Complete script with full dialogue for all scenes',
      }

  const jsonStructure = (isChinese ? zhStructure : enStructure)[generationType] || (isChinese ? zhStructure.full_script : enStructure.full_script)
  const tn = typename[generationType] || typename.full_script
  const td = typedesc[generationType] || typedesc.full_script

  const extra = (isChinese ? generationType === 'character' : generationType === 'character')
    ? (isChinese ? '\n建议生成 3-6 个角色，每个角色详细刻画。' : '\nGenerate 3-6 detailed characters.')
    : ''

  if (isChinese) {
    const batchHeader = startEpisode
      ? `\n## 分批生成说明\n这是第 ${startEpisode} 集起后续部分的生成请求。之前已生成：${existingSummary || '剧情已展开'}。请继续推进剧情，保持人物连贯性。`
      : ''

    return `你是一位专业的短剧剧本创作大师。请根据用户需求${tn === '分集大纲' ? '生成一份分集大纲' : tn === '场景拆分' ? '进行场景拆分' : tn === '人物弧光' ? '设计人物弧光' : '创作完整剧本'}。${batchHeader}

## 当前模式：${tn}
${td}${extra}

## 输出格式要求
严格按照以下 JSON 结构输出，不要添加多余字段：

${jsonStructure}

## 创作要求
1. 题材：${genreList}
2. 集数：${epCountStr}
3. 剧情有悬念和反转，节奏紧凑
4. 角色性格鲜明
5. 每集结尾有悬念钩子
6. 全部中文输出

确保输出是有效 JSON，不要包含额外说明文字。`
  }

  const batchHeaderEn = startEpisode
    ? `\n\n## Batch Generation\nThis is a continuation request starting from episode ${startEpisode}. Previously generated: ${existingSummary || 'the story has started'}. Continue the plot naturally, keeping characters consistent.`
    : ''

  return `You are a professional short drama scriptwriter. Generate content based on user request.${batchHeaderEn}

## Current Mode: ${tn}
${td}${extra}

## Output Format Requirements
Strictly follow this JSON structure, no extra fields:

${jsonStructure}

## Requirements
1. Genres: ${genreList}
2. Episodes: ${epCountStr}
3. Plot must have suspense and twists
4. Characters must have distinct personalities
5. Each episode ends with a cliffhanger
6. Output in English

Ensure valid JSON output only.`
}

export interface BuildUserPromptParams {
  genres: string[]
  episodeCount: number
  generationType: string
  additionalInstructions?: string
}

export function buildUserPrompt(params: BuildUserPromptParams): string {
  const { genres, episodeCount, generationType, additionalInstructions } = params
  const genreList = genres.join(' + ')

  const typeInstructions: Record<string, string> = {
    outline: 'Generate a detailed episode-by-episode outline with hooks and summaries only (no full dialogue, no scene details).',
    scene: 'For each episode, provide a complete scene breakdown including locations, durations, and character appearances (no dialogue).',
    character: 'Focus on character development arcs. Include detailed personality profiles, backstories, and how each character changes across the episodes.',
    full_script: 'Generate the complete script with full dialogue for all scenes across all episodes.',
  }

  const baseInstruction = typeInstructions[generationType] || typeInstructions.outline

  let prompt = `Generate a ${genreList} short drama with ${episodeCount} episodes.`
  prompt += `\n\nGeneration type: ${generationType}`
  prompt += `\n${baseInstruction}`

  if (additionalInstructions) {
    prompt += `\n\nAdditional instructions: ${additionalInstructions}`
  }

  return prompt
}