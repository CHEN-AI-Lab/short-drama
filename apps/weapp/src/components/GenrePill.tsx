import { View, Text } from '@tarojs/components'
import type { ReactNode } from 'react'

interface Props {
  icon?: string
  label: string
  active: boolean
  onClick: () => void
  small?: boolean
}

export default function GenrePill({ icon, label, active, onClick, small }: Props) {
  return (
    <View
      className={`pill ${active ? 'pill-active' : ''}`}
      style={small ? { padding: '6px 12px', fontSize: 12 } : {}}
      onClick={onClick}
    >
      {icon && <Text>{icon}</Text>}
      <Text>{label}</Text>
    </View>
  )
}