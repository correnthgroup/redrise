import { TaskBoardPage } from '@/components/blocks/pages/task-board-page'

export default function Page() {
  return <TaskBoardPage tasks={[]} agents={[]} workspaces={[]} flows={[]} filtersOpen={false} workspaceFilter="all" flowFilter="all" agentFilter="all" onWorkspaceFilterChange={() => {}} onFlowFilterChange={() => {}} onAgentFilterChange={() => {}} />
}
