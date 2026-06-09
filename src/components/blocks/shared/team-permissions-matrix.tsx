import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const WORKSPACES = ['Workspace A', 'Workspace B', 'Workspace C']
const MEMBERS = ['Member 1', 'Member 2', 'Member 3', 'Member 4']

export function TeamPermissionsMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Team Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium text-muted-foreground">Member</th>
                {WORKSPACES.map((w) => (
                  <th key={w} className="px-2 py-2 text-left font-medium text-muted-foreground">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr key={m} className="border-b last:border-0">
                  <td className="py-2">{m}</td>
                  {WORKSPACES.map((w) => (
                    <td key={w} className="px-2 py-2">
                      <Checkbox aria-label={`${m} in ${w}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
