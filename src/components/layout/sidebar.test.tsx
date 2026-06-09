import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Sidebar } from '@/components/layout/sidebar'

describe('Sidebar', () => {
  it('toggles collapse and keeps navigation visible', async () => {
    const user = userEvent.setup()

    render(
      <Sidebar
        active="dashboard"
        onSelect={() => undefined}
        onSignOut={() => undefined}
        user={{ name: 'Redrise Owner', email: 'owner@redrise.me' }}
      />,
    )

    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))

    expect(screen.getByLabelText('Primary navigation')).toHaveAttribute('data-collapsed', 'true')
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
  })
})
