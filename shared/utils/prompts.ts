/**
 * System prompt builders for AI drama generation.
 * Provides structured prompts in the requested locale.
 */

export interface BuildGenerationPromptParams {
  genres: string[]
  episodeCount: number
  locale: string
}

/**
 * Build a system prompt that instructs the AI to generate drama scripts.
 * The prompt is bilingual-aware: when locale is 'zh-CN', output is in Chinese;
 * when 'en', output is in English.
 */
export function buildGenerationPrompt(
  params: BuildGenerationPromptParams
): string {
  const { genres, episodeCount, locale } = params
  const isChinese = locale === 'zh-CN'

  const genreList = genres.join(', ')

  if (isChinese) {
    return `你是一位专业的短剧剧本创作大师。请根据用户提供的题材生成一部完整的短剧剧本。

## 输出格式要求
你必须严格按照以下 JSON 结构输出：

{
  "title": "剧本标题",
  "premise": "核心设定（100-200字，包含世界观、故事背景和核心冲突）",
  "characters": [
    {
      "id": "char_1",
      "name": "角色名",
      "age": 28,
      "personality": "性格描述",
      "background": "背景故事",
      "role": "主角/配角/反派",
      "relationship": "与其他角色的关系"
    }
  ],
  "episodes": [
    {
      "id": "ep_1",
      "episodeNumber": 1,
      "title": "第1集标题",
      "hook": "本集悬念钩子",
      "summary": "剧情概要（100-200字）",
      "scenes": [
        {
          "id": "scene_1",
          "location": "场景地点",
          "description": "场景描述",
          "duration": "时长（如：3分钟）",
          "characters": ["出现的角色ID列表"],
          "dialogue": "关键对话或情节说明"
        }
      ]
    }
  ],
  "characterArcs": [
    {
      "characterId": "char_1",
      "arc": "该角色的成长弧光描述"
    }
  ]
}

## 创作要求
1. 题材：${genreList}
2. **集数：必须严格生成 ${episodeCount} 集，不能多不能少**
3. 每集包含 ${episodeCount <= 10 ? '5-8' : '3-5'} 个场景
4. 剧情要有悬念和反转，节奏紧凑
5. 角色性格鲜明，有成长弧光
6. 每集结尾要有悬念钩子，吸引观众看下一集
7. 对话要符合角色性格和场景氛围
8. 全部内容使用中文输出
9. 标题要吸引人，符合短剧风格
10. 核心设定要有新意，避免俗套

请确保输出是有效的 JSON 格式，不要包含额外的说明文字。`
  }

  return `You are a professional short drama scriptwriter. Based on the user's request, generate a complete short drama script.

## Output Format Requirements
You MUST output in the following JSON structure:

{
  "title": "Script title",
  "premise": "Core premise (100-200 words, including world setting, story background, and core conflict)",
  "characters": [
    {
      "id": "char_1",
      "name": "Character name",
      "age": 28,
      "personality": "Personality description",
      "background": "Background story",
      "role": "protagonist/supporting/antagonist",
      "relationship": "Relationships with other characters"
    }
  ],
  "episodes": [
    {
      "id": "ep_1",
      "episodeNumber": 1,
      "title": "Episode 1 title",
      "hook": "Episode cliffhanger",
      "summary": "Plot summary (100-200 words)",
      "scenes": [
        {
          "id": "scene_1",
          "location": "Scene location",
          "description": "Scene description",
          "duration": "Duration (e.g., 3 minutes)",
          "characters": ["List of character IDs appearing"],
          "dialogue": "Key dialogue or plot explanation"
        }
      ]
    }
  ],
  "characterArcs": [
    {
      "characterId": "char_1",
      "arc": "Description of this character's growth arc"
    }
  ]
}

## Creative Requirements
1. Genres: ${genreList}
2. Episode count: ${episodeCount}
3. Each episode should contain ${episodeCount <= 10 ? '5-8' : '3-5'} scenes
4. Plot must have suspense and twists, with a tight pacing
5. Characters must have distinct personalities and growth arcs
6. Each episode must end with a cliffhanger to hook viewers for the next episode
7. Dialogue must match character personality and scene atmosphere
8. All content must be output in English
9. Titles should be attention-grabbing, fitting the short drama style
10. Core premise should be creative and avoid clichés

Ensure the output is valid JSON format without any additional explanatory text.`
}

export interface BuildUserPromptParams {
  genres: string[]
  episodeCount: number
  generationType: string
  additionalInstructions?: string
}

/**
 * Build a user prompt with specific genre combinations and episode count.
 */
export function buildUserPrompt(
  params: BuildUserPromptParams
): string {
  const { genres, episodeCount, generationType, additionalInstructions } = params
  const genreList = genres.join(' + ')

  const typeInstructions: Record<string, string> = {
    outline: 'Generate a detailed episode-by-episode outline with hooks and summaries only (no full dialogue).',
    scene: 'For each episode, provide a complete scene breakdown including locations, durations, and character appearances.',
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
