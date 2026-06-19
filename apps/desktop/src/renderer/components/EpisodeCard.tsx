import React from 'react'
import type { EpisodeOutline } from 'shared'

interface EpisodeCardProps {
  episode: EpisodeOutline
  locale: string
}

export default function EpisodeCard({ episode, locale }: EpisodeCardProps) {
  return (
    <div className="episode-card">
      <div className="episode-card-header">
        <span className="episode-number">
          {locale === 'zh-CN' ? `第 ${episode.episode} 集` : `Episode ${episode.episode}`}
        </span>
        <span className="episode-title">{episode.title}</span>
      </div>
      <p className="episode-synopsis">{episode.synopsis}</p>
      {episode.scenes.length > 0 && (
        <div className="episode-scenes">
          <strong>{locale === 'zh-CN' ? '场景' : 'Scenes'}:</strong>
          <div className="scene-list">
            {episode.scenes.map((scene, i) => (
              <div key={i} className="scene-item">
                <div className="scene-header">
                  <span className="scene-title">{scene.title}</span>
                  <span className="scene-location">{scene.location}</span>
                  <span className="scene-duration">{scene.duration}</span>
                </div>
                <p className="scene-desc">{scene.description}</p>
                {scene.keyDialogue.length > 0 && (
                  <div className="scene-dialogue">
                    {scene.keyDialogue.map((line, j) => (
                      <div key={j} className="dialogue-line">"{line}"</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {episode.hook && (
        <div className="episode-hook">
          <strong>{locale === 'zh-CN' ? '悬念钩子' : 'Hook'}:</strong> {episode.hook}
        </div>
      )}
    </div>
  )
}