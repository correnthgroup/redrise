import type { ReactNode } from 'react'
import styles from './app-frame.module.css'

type AppFrameProps = {
  children: ReactNode
  panelClassName?: string
}

export function AppFrame({ children, panelClassName }: AppFrameProps) {
  return (
    <div className={styles.outer}>
      <div className={`${styles.panel} ${panelClassName ?? ''}`.trim()}>
        {children}
      </div>
    </div>
  )
}
