# Restore brackets ONLY in specific files and specific patterns
# This script is manually curated to avoid over-matching

function Add-BracketsToFile {
    param([string]$Path, [string[]]$Replacements)
    if (!(Test-Path $Path)) { return }
    $content = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    $original = $content
    foreach ($r in $Replacements) {
        $parts = $r -split '=>', 2
        if ($parts.Length -eq 2) {
            $content = $content.Replace($parts[0].Trim(), $parts[1].Trim())
        }
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($Path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $Path"
    }
}

# === activity-feed.tsx ===
Add-BracketsToFile "src\components\blocks\shared\activity-feed.tsx" @(
    "'event 1 · agent name · 2m ago'" => "'[event 1] · [agent name] · [2m ago]'"
    "'event 2 · agent name · 5m ago'" => "'[event 2] · [agent name] · [5m ago]'"
    "'event 3 · agent name · 11m ago'" => "'[event 3] · [agent name] · [11m ago]'"
    "'event 4 · agent name · 24m ago'" => "'[event 4] · [agent name] · [24m ago]'"
    "'event 5 · agent name · 1h ago'" => "'[event 5] · [agent name] · [1h ago]'"
    "'alert 1 · system · 3m ago'" => "'[alert 1] · [system] · [3m ago]'"
    "'alert 2 · agent · 14m ago'" => "'[alert 2] · [agent] · [14m ago]'"
    "'alert 3 · workspace · 36m ago'" => "'[alert 3] · [workspace] · [36m ago]'"
    "'notification 1 · member · 4m ago'" => "'[notification 1] · [member] · [4m ago]'"
    "'notification 2 · review · 18m ago'" => "'[notification 2] · [review] · [18m ago]'"
    "'notification 3 · task · 52m ago'" => "'[notification 3] · [task] · [52m ago]'"
    "'change 1 · policy updated · 6m ago'" => "'[change 1] · [policy updated] · [6m ago]'"
    "'change 2 · flow edited · 27m ago'" => "'[change 2] · [flow edited] · [27m ago]'"
    "'change 3 · integration changed · 1h ago'" => "'[change 3] · [integration changed] · [1h ago]'"
    "'audit 1 · sign-in · 9m ago'" => "'[audit 1] · [sign-in] · [9m ago]'"
    "'audit 2 · permission change · 41m ago'" => "'[audit 2] · [permission change] · [41m ago]'"
    "'audit 3 · export requested · 2h ago'" => "'[audit 3] · [export requested] · [2h ago]'"
)

# === sidebar.tsx ===
Add-BracketsToFile "src\components\layout\sidebar.tsx" @(
    "'Workspace A · healthy'" => "'[Workspace A] · healthy'"
    "'Workspace B · warning'" => "'[Workspace B] · warning'"
    "'Workspace C · healthy'" => "'[Workspace C] · healthy'"
    "'Workspace D · stopped'" => "'[Workspace D] · stopped'"
    "'Flow X · running'" => "'[Flow X] · running'"
    "'Flow Y · paused'" => "'[Flow Y] · paused'"
    "'Flow Z · running'" => "'[Flow Z] · running'"
    "'Flow W · error'" => "'[Flow W] · error'"
    "'12 in backlog'" => "'[12] in backlog'"
    "'4 in progress'" => "'[4] in progress'"
    "'3 in review'" => "'[3] in review'"
    "'27 done this week'" => "'[27] done this week'"
    "'8 running'" => "'[8] running'"
    "'2 paused'" => "'[2] paused'"
    "'1 error'" => "'[1] error'"
    "'3 idle'" => "'[3] idle'"
    "'+12% WoW tasks'" => "'[+12%] WoW tasks'"
    "'+4% active agents'" => "'[+4%] active agents'"
    "'98.2% uptime'" => "'[98.2%] uptime'"
    "'42ms p95 latency'" => "'[42ms] p95 latency'"
    ">Brand<" => ">[Brand]<"
    ">Product Tagline<" => ">[Product Tagline]<"
)

# === operations-grid.tsx ===
Add-BracketsToFile "src\components\blocks\shared\operations-grid.tsx" @(
    "{ name: 'Team A'" => "{ name: '[Team A]'"
    "{ name: 'Team B'" => "{ name: '[Team B]'"
    "{ name: 'Team C'" => "{ name: '[Team C]'"
    "{ name: 'Team D'" => "{ name: '[Team D]'"
    "{ name: 'Model X'" => "{ name: '[Model X]'"
    "{ name: 'Model Y'" => "{ name: '[Model Y]'"
    "{ name: 'Model Z'" => "{ name: '[Model Z]'"
    "{ name: 'Region A'" => "{ name: '[Region A]'"
    "{ name: 'Region B'" => "{ name: '[Region B]'"
    "{ name: 'Region C'" => "{ name: '[Region C]'"
    "'Item needing attention 1'" => "'[Item needing attention 1]'"
    "'Item needing attention 2'" => "'[Item needing attention 2]'"
    "'Item needing attention 3'" => "'[Item needing attention 3]'"
    "'Alert: threshold exceeded'" => "'[Alert: threshold exceeded]'"
    "'Alert: agent offline'" => "'[Alert: agent offline]'"
    "'Alert: config drift detected'" => "'[Alert: config drift detected]'"
    "'Config: rate limit updated'" => "'[Config: rate limit updated]'"
    "'Config: model version changed'" => "'[Config: model version changed]'"
    "'Config: permission updated'" => "'[Config: permission updated]'"
    "'Indicator: uptime 99.9%'" => "'[Indicator: uptime 99.9%]'"
    "'Indicator: avg latency 42ms'" => "'[Indicator: avg latency 42ms]'"
    "'Indicator: error rate 0.3%'" => "'[Indicator: error rate 0.3%]'"
    ">Staffing<" => ">[Staffing]<"
    ">Model Breakdown<" => ">[Model Breakdown]<"
    ">Capacity Mix<" => ">[Capacity Mix]<"
    ">Attention Queue<" => ">[Attention Queue]<"
    ">Alerts<" => ">[Alerts]<"
    ">Configuration Watch<" => ">[Configuration Watch]<"
    ">Operational Indicators<" => ">[Operational Indicators]<"
)

# === kpi-cards.tsx ===
Add-BracketsToFile "src\components\blocks\shared\kpi-cards.tsx" @(
    "{ label: 'Metric 1'" => "{ label: '[Metric 1]'"
    "{ label: 'Metric 2'" => "{ label: '[Metric 2]'"
    "{ label: 'Metric 3'" => "{ label: '[Metric 3]'"
    "{ label: 'Metric 4'" => "{ label: '[Metric 4]'"
    "{ label: 'Metric 5'" => "{ label: '[Metric 5]'"
    "{ label: 'Metric 6'" => "{ label: '[Metric 6]'"
    "{ label: 'Metric 7'" => "{ label: '[Metric 7]'"
    ">Chart Title<" => ">[Chart Title]<"
)

# === chart-tabs.tsx ===
Add-BracketsToFile "src\components\blocks\shared\chart-tabs.tsx" @(
    "{ name: 'Usage'" => "{ name: '[Usage]'"
    "{ name: 'Errors'" => "{ name: '[Errors]'"
    "{ name: 'Latency ms'" => "{ name: '[Latency ms]'"
    ">Chart Title<" => ">[Chart Title]<"
)

# === workflow-pipeline.tsx ===
Add-BracketsToFile "src\components\blocks\shared\workflow-pipeline.tsx" @(
    "name: 'Node 1'" => "name: '[Node 1]'"
    "name: 'Node 2'" => "name: '[Node 2]'"
    "name: 'Node 3'" => "name: '[Node 3]'"
    "name: 'Node 4'" => "name: '[Node 4]'"
    "name: 'Node 5'" => "name: '[Node 5]'"
    ">Workflow Pipeline<" => ">[Workflow Pipeline]<"
)

# === team-permissions-matrix.tsx ===
Add-BracketsToFile "src\components\blocks\shared\team-permissions-matrix.tsx" @(
    "'Workspace A', 'Workspace B', 'Workspace C'" => "'[Workspace A]', '[Workspace B]', '[Workspace C]'"
    "'Member 1', 'Member 2', 'Member 3', 'Member 4'" => "'[Member 1]', '[Member 2]', '[Member 3]', '[Member 4]'"
    ">Team Permissions<" => ">[Team Permissions]<"
)

# === api-keys-manager.tsx ===
Add-BracketsToFile "src\components\blocks\shared\api-keys-manager.tsx" @(
    "'agents:read', 'agents:write', 'tasks:read', 'tasks:write', 'analytics:read', 'integrations:manage'" => "'[agents:read]', '[agents:write]', '[tasks:read]', '[tasks:write]', '[analytics:read]', '[integrations:manage]'"
    "name: 'Production · dashboard'" => "name: '[Production · dashboard]'"
    "prefix: 'agra_live_8f3c'" => "prefix: '[agra_live_8f3c]'"
    "secret: 'agra_live_8f3cxxx...'" => "secret: '[agra_live_8f3cxxx...]'"
    "createdAt: '2026-05-12'" => "createdAt: '[2026-05-12]'"
    "lastUsed: '12 min ago'" => "lastUsed: '[12 min ago]'"
    "scopes: ['agents:read', 'tasks:read', 'analytics:read']" => "scopes: ['[agents:read]', '[tasks:read]', '[analytics:read]']"
    "name: 'Staging · CI pipeline'" => "name: '[Staging · CI pipeline]'"
    "prefix: 'agra_test_2a91'" => "prefix: '[agra_test_2a91]'"
    "secret: 'agra_test_2a91xxx...'" => "secret: '[agra_test_2a91xxx...]'"
    "createdAt: '2026-04-28'" => "createdAt: '[2026-04-28]'"
    "lastUsed: '3 hours ago'" => "lastUsed: '[3 hours ago]'"
    "scopes: ['agents:read', 'agents:write', 'tasks:read', 'tasks:write']" => "scopes: ['[agents:read]', '[agents:write]', '[tasks:read]', '[tasks:write]']"
    "name: 'Local · dev laptop'" => "name: '[Local · dev laptop]'"
    "prefix: 'agra_dev_77b0'" => "prefix: '[agra_dev_77b0]'"
    "secret: 'agra_dev_77b0xxx...'" => "secret: '[agra_dev_77b0xxx...]'"
    "createdAt: '2026-06-01'" => "createdAt: '[2026-06-01]'"
    "lastUsed: '1 day ago'" => "lastUsed: '[1 day ago]'"
    "scopes: ['agents:read']" => "scopes: ['[agents:read]']"
    ">API Keys<" => ">[API Keys]<"
    ">Created<" => ">[Created]<"
    ">Last used<" => ">[Last used]<"
    "Copied to clipboard." => "[Copied to clipboard.]"
)

# === sessions-list.tsx ===
Add-BracketsToFile "src\components\blocks\shared\sessions-list.tsx" @(
    "browser: 'Chrome 124 · macOS'" => "browser: '[Chrome 124 · macOS]'"
    "location: 'Sao Paulo, BR'" => "location: '[Sao Paulo, BR]'"
    "ip: '187.45.12.103'" => "ip: '[187.45.12.103]'"
    "lastActive: 'Active now'" => "lastActive: '[Active now]'"
    "browser: 'Safari Mobile · iOS 17'" => "browser: '[Safari Mobile · iOS 17]'"
    "lastActive: '2 hours ago'" => "lastActive: '[2 hours ago]'"
    "browser: 'Edge 124 · Windows 11'" => "browser: '[Edge 124 · Windows 11]'"
    "location: 'Rio de Janeiro, BR'" => "location: '[Rio de Janeiro, BR]'"
    "ip: '201.20.55.21'" => "ip: '[201.20.55.21]'"
    "lastActive: 'Yesterday at 18:42'" => "lastActive: '[Yesterday at 18:42]'"
    "browser: 'Safari · iPadOS 17'" => "browser: '[Safari · iPadOS 17]'"
    "location: 'Curitiba, BR'" => "location: '[Curitiba, BR]'"
    "ip: '177.92.10.4'" => "ip: '[177.92.10.4]'"
    "lastActive: '3 days ago'" => "lastActive: '[3 days ago]'"
    "browser: 'Headless · CLI 1.4'" => "browser: '[Headless · CLI 1.4]'"
    "location: 'AWS Sao Paulo'" => "location: '[AWS Sao Paulo]'"
    "ip: '18.230.12.7'" => "ip: '[18.230.12.7]'"
    "lastActive: '5 days ago'" => "lastActive: '[5 days ago]'"
    ">Active Sessions<" => ">[Active Sessions]<"
    ">This Device<" => ">[This Device]<"
    ">Sign Out<" => ">[Sign Out]<"
)

# === member-list-table.tsx ===
Add-BracketsToFile "src\components\blocks\shared\member-list-table.tsx" @(
    "'Manager', 'Executive', 'Designer', 'Engineer'" => "'[Manager]', '[Executive]', '[Designer]', '[Engineer]'"
    "'Organization', 'Projects', 'Developer'" => "'[Organization]', '[Projects]', '[Developer]'"
    "employed: '23/04/18'" => "employed: '[23/04/18]'"
    ">Members List<" => ">[Members List]<"
    ">Add Member<" => ">[Add Member]<"
)

# === add-member-modal.tsx ===
Add-BracketsToFile "src\components\blocks\shared\add-member-modal.tsx" @(
    "name: 'Pending invite 1', email: 'invite1@example.com'" => "name: '[Pending invite 1]', email: '[invite1@example.com]'"
    "name: 'Pending invite 2', email: 'invite2@example.com'" => "name: '[Pending invite 2]', email: '[invite2@example.com]'"
    "name: 'Pending invite 3', email: 'invite3@example.com'" => "name: '[Pending invite 3]', email: '[invite3@example.com]'"
    'placeholder="email@domain.com"' => 'placeholder="[email protected]"'
)

# === change-password.tsx ===
Add-BracketsToFile "src\components\blocks\shared\change-password.tsx" @(
    "label: 'At least 8 characters long'" => "label: '[At least 8 characters long]'"
    "label: 'One uppercase letter (A-Z)'" => "label: '[One uppercase letter (A-Z)]'"
    "label: 'One lowercase letter (a-z)'" => "label: '[One lowercase letter (a-z)]'"
    "label: 'One number (0-9)'" => "label: '[One number (0-9)]'"
    "label: 'One special character (!@#'" => "label: '[One special character (!@#'"
    ">Change Password<" => ">[Change Password]<"
    ">Password Requirements<" => ">[Password Requirements]<"
    ">Security Best Practices<" => ">[Security Best Practices]<"
    ">Current Password<" => ">[Current Password]<"
    ">New Password<" => ">[New Password]<"
    ">Confirm New Password<" => ">[Confirm New Password]<"
    ">Cancel<" => ">[Cancel]<"
    ">Update Password<" => ">[Update Password]<"
)

# === onboarding-empty.tsx ===
Add-BracketsToFile "src\components\blocks\shared\onboarding-empty.tsx" @(
    "title: 'Healthy Workspaces'" => "title: '[Healthy Workspaces]'"
    "description: 'Stable workspaces currently operating within target.'" => "description: '[Stable workspaces currently operating within target.]'"
    "title: 'Maintenance Workspaces'" => "title: '[Maintenance Workspaces]'"
    "description: 'Workspaces requiring tuning, review or configuration changes.'" => "description: '[Workspaces requiring tuning, review or configuration changes.]'"
    "title: 'Pending Workspaces'" => "title: '[Pending Workspaces]'"
    "description: 'New or incomplete workspaces waiting for the next setup step.'" => "description: '[New or incomplete workspaces waiting for the next setup step.]'"
    ">Welcome to your workspace<" => ">[Welcome to your workspace]<"
)

# === settings-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\settings-page.tsx" @(
    "title: 'Personal Information'" => "title: '[Personal Information]'"
    "description: 'Avatar, name, email, phone, address and other personal details.'" => "description: '[Avatar, name, email, phone, address and other personal details.]'"
    "title: 'Change Password'" => "title: '[Change Password]'"
    "description: 'Update the password used to sign in to the workspace.'" => "description: '[Update the password used to sign in to the workspace.]'"
    "title: 'Active Sessions'" => "title: '[Active Sessions]'"
    "description: 'Review and revoke devices signed in to your workspace.'" => "description: '[Review and revoke devices signed in to your workspace.]'"
    "title: 'API Keys'" => "title: '[API Keys]'"
    "description: 'Create, label and revoke programmatic access keys.'" => "description: '[Create, label and revoke programmatic access keys.]'"
    "title: 'Integration Setup'" => "title: '[Integration Setup]'"
    "description: 'Connect the workspace to Slack, GitHub, Postgres and more.'" => "description: '[Connect the workspace to Slack, GitHub, Postgres and more.]'"
    "title: 'Team Members'" => "title: '[Team Members]'"
    "description: 'See information about all members and invite new ones.'" => "description: '[See information about all members and invite new ones.]'"
    ">Account Shortcuts<" => ">[Account Shortcuts]<"
)

# === integration-setup-wizard.tsx ===
Add-BracketsToFile "src\components\blocks\shared\integration-setup-wizard.tsx" @(
    "name: 'Slack'" => "name: '[Slack]'"
    "description: 'Send agent notifications to Slack channels.'" => "description: '[Send agent notifications to Slack channels.]'"
    "category: 'Communication'" => "category: '[Communication]'"
    "name: 'GitHub'" => "name: '[GitHub]'"
    "description: 'Trigger agents on pull request and issue events.'" => "description: '[Trigger agents on pull request and issue events.]'"
    "category: 'Source Control'" => "category: '[Source Control]'"
    "name: 'Postgres'" => "name: '[Postgres]'"
    "description: 'Read and write to an external Postgres database.'" => "description: '[Read and write to an external Postgres database.]'"
    "category: 'Data'" => "category: '[Data]'"
    "name: 'Discord'" => "name: '[Discord]'"
    "description: 'Route agent output to Discord channels via webhook.'" => "description: '[Route agent output to Discord channels via webhook.]'"
    "name: 'Generic Webhook'" => "name: '[Generic Webhook]'"
    "description: 'POST agent events to a custom HTTP endpoint.'" => "description: '[POST agent events to a custom HTTP endpoint.]'"
    "category: 'Webhooks'" => "category: '[Webhooks]'"
    "label: 'Select Integration'" => "label: '[Select Integration]'"
    "label: 'Configure'" => "label: '[Configure]'"
    "label: 'Test Connection'" => "label: '[Test Connection]'"
    "label: 'Review'" => "label: '[Review]'"
    ">Integration Setup<" => ">[Integration Setup]<"
    ">Choose an Integration<" => ">[Choose an Integration]<"
    ">Configuring <" => ">[Configuring] <"
    ">Display Name<" => ">[Display Name]<"
    ">Endpoint URL<" => ">[Endpoint URL]<"
    ">API Token<" => ">[API Token]<"
    ">Test Connection<" => ">[Test Connection]<"
    ">Run Test<" => ">[Run Test]<"
    ">Testing...<" => ">[Testing...]<"
    ">Connection successful.<" => ">[Connection successful.]<"
    ">Back<" => ">[Back]<"
    ">Finish<" => ">[Finish]<"
    ">Next<" => ">[Next]<"
)

# === analytics-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\analytics-page.tsx" @(
    "agent: 'Agent 1'" => "agent: '[Agent 1]'"
    "agent: 'Agent 2'" => "agent: '[Agent 2]'"
    "agent: 'Agent 3'" => "agent: '[Agent 3]'"
    ">Per-agent breakdown<" => ">[Per-agent breakdown]<"
)

# === agent-list-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\agent-list-page.tsx" @(
    "model: ['Model A', 'Model B', 'Model C']" => "model: ['[Model A]', '[Model B]', '[Model C]']"
    ">Agents<" => ">[Agents]<"
)

# === flow-list-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\flow-list-page.tsx" @(
    "name: 'Flow 1', status: 'running', owner: 'Owner A'" => "name: '[Flow 1]', status: 'running', owner: '[Owner A]'"
    "name: 'Flow 2', status: 'paused', owner: 'Owner B'" => "name: '[Flow 2]', status: 'paused', owner: '[Owner B]'"
    "name: 'Flow 3', status: 'error', owner: 'Owner C'" => "name: '[Flow 3]', status: 'error', owner: '[Owner C]'"
    "name: 'Flow 4', status: 'running', owner: 'Owner D'" => "name: '[Flow 4]', status: 'running', owner: '[Owner D]'"
    ">Flows<" => ">[Flows]<"
)

# === review-workspace-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\review-workspace-page.tsx" @(
    ">Review Workspace<" => ">[Review Workspace]<"
    ">Identity<" => ">[Identity]<"
    ">Mission<" => ">[Mission]<"
    ">Health<" => ">[Health]<"
    ">Flows<" => ">[Flows]<"
)

# === review-task-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\review-task-page.tsx" @(
    ">Review Task<" => ">[Review Task]<"
    ">Identity<" => ">[Identity]<"
    ">Briefing<" => ">[Briefing]<"
    ">Team<" => ">[Team]<"
    ">Reviewers<" => ">[Reviewers]<"
)

# === create-workspace-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\create-workspace-page.tsx" @(
    ">New Workspace<" => ">[New Workspace]<"
    "placeholder='workspace name'" => "placeholder='[workspace name]'"
    "placeholder='mission statement'" => "placeholder='[mission statement]'"
    "'empty'" => "'[empty]'"
)

# === create-task-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\create-task-page.tsx" @(
    ">New Task<" => ">[New Task]<"
    "placeholder='task title'" => "placeholder='[task title]'"
    "placeholder='what needs to happen?'" => "placeholder='[what needs to happen?]'"
    "'empty'" => "'[empty]'"
)

# === agent-create-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\agent-create-page.tsx" @(
    ">New Agent<" => ">[New Agent]<"
    "placeholder='agent name'" => "placeholder='[agent name]'"
    "placeholder='what does this agent do?'" => "placeholder='[what does this agent do?]'"
    "'empty'" => "'[empty]'"
)

# === agent-detail-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\agent-detail-page.tsx" @(
    ">Agent name<" => ">[Agent name]<"
    ">active<" => ">[active]<"
    ">agent description placeholder<" => ">[agent description placeholder]<"
    ">Recent activity<" => ">[Recent activity]<"
    ">event 1<" => ">[event 1]<"
    ">event 2<" => ">[event 2]<"
    ">event 3<" => ">[event 3]<"
)

# === flow-builder-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\flow-builder-page.tsx" @(
    "label: 'Step 1: trigger'" => "label: '[Step 1: trigger]'"
    "label: 'Step 2: enrich'" => "label: '[Step 2: enrich]'"
    "label: 'Step 3: decide'" => "label: '[Step 3: decide]'"
    "label: 'Step 4: deliver'" => "label: '[Step 4: deliver]'"
    ">step description<" => ">[step description]<"
    ">Flow Editor<" => ">[Flow Editor]<"
)

# === account-basic-info-page.tsx ===
Add-BracketsToFile "src\components\blocks\pages\account-basic-info-page.tsx" @(
    ">Personal Information<" => ">[Personal Information]<"
    ">Basic Details<" => ">[Basic Details]<"
    ">First Name<" => ">[First Name]<"
    'placeholder="Adm" defaultValue="Adm"' => 'placeholder="[Adm]" defaultValue="[Adm]"'
    ">Last Name<" => ">[Last Name]<"
    'placeholder="Agentra" defaultValue="Agentra"' => 'placeholder="[Agentra]" defaultValue="[Agentra]"'
    ">Username<" => ">[Username]<"
    ">Profile<" => ">[Profile]<"
    ">Profile Avatar<" => ">[Profile Avatar]<"
    ">Replace<" => ">[Replace]<"
    ">Upload New<" => ">[Upload New]<"
    ">Remove<" => ">[Remove]<"
    ">Professional Information<" => ">[Professional Information]<"
    ">Gender<" => ">[Gender]<"
    ">Select Gender<" => ">[Select Gender]<"
    ">Placeholder A<" => ">[Placeholder A]<"
    ">Placeholder B<" => ">[Placeholder B]<"
    ">Birth Date<" => ">[Birth Date]<"
    ">Select a date<" => ">[Select a date]<"
    ">Profession<" => ">[Profession]<"
    ">Select Profession<" => ">[Select Profession]<"
    ">Placeholder Profession<" => ">[Placeholder Profession]<"
    ">Placeholder Role<" => ">[Placeholder Role]<"
    ">Education<" => ">[Education]<"
    ">Select Level<" => ">[Select Level]<"
    ">Placeholder Level<" => ">[Placeholder Level]<"
    ">Placeholder Degree<" => ">[Placeholder Degree]<"
    ">Contact Information<" => ">[Contact Information]<"
    ">Email Address<" => ">[Email Address]<"
    'placeholder="adm@agentra.ai" defaultValue="adm@agentra.ai"' => 'placeholder="[email protected]" defaultValue="[email protected]"'
    ">Confirm Email<" => ">[Confirm Email]<"
    ">Phone Number<" => ">[Phone Number]<"
    'placeholder="+00 0000-0000" defaultValue="+00 0000-0000"' => 'placeholder="[+00 0000-0000]" defaultValue="[+00 0000-0000]"'
    ">Location<" => ">[Location]<"
    'placeholder="City, Country" defaultValue="City, Country"' => 'placeholder="[City, Country]" defaultValue="[City, Country]"'
    ">Additional Information<" => ">[Additional Information]<"
    ">Preferred Language<" => ">[Preferred Language]<"
    ">Select Language<" => ">[Select Language]<"
    ">English<" => ">[English]<"
    ">Portuguese<" => ">[Portuguese]<"
    ">Time Zone<" => ">[Time Zone]<"
    ">Select Time Zone<" => ">[Select Time Zone]<"
    ">UTC-03:00<" => ">[UTC-03:00]<"
    ">UTC+00:00<" => ">[UTC+00:00]<"
    ">Website<" => ">[Website]<"
    'placeholder="https://example.com" defaultValue="https://example.com"' => 'placeholder="[https://example.com]" defaultValue="[https://example.com]"'
    ">Portfolio<" => ">[Portfolio]<"
    'placeholder="portfolio link" defaultValue="portfolio link"' => 'placeholder="[portfolio link]" defaultValue="[portfolio link]"'
    ">Cancel<" => ">[Cancel]<"
    ">Save Changes<" => ">[Save Changes]<"
)

# === auth-flow.tsx ===
Add-BracketsToFile "src\components\auth\auth-flow.tsx" @(
    "'Art is the lie that enables us to realize the truth.'" => "'[Art is the lie that enables us to realize the truth.]'"
    "'Every artist was first an amateur.'" => "'[Every artist was first an amateur.]'"
    "'Creativity takes courage.'" => "'[Creativity takes courage.]'"
    '>Brand Name<' => '>[Brand Name]<'
    '>Product Tagline<' => '>[Product Tagline]<'
    'placeholder="email protected"' => 'placeholder="[email protected]"'
    'placeholder="password"' => 'placeholder="[password]"'
    'placeholder="Your name"' => 'placeholder="[Your name]"'
    'placeholder="choose a password"' => 'placeholder="[choose a password]"'
    "setError('')" => "setError('[Placeholder: SSO with Google]')"
    "setError('')" => "setError('[Placeholder: forgot password flow]')"
)

# === command-palette.tsx ===
Add-BracketsToFile "src\components\blocks\shared\command-palette.tsx" @(
    'placeholder="[Type a command or search...]"' => 'placeholder="[Type a command or search...]"'
    ">No results<" => ">[No results]<"
)

Write-Host "Done!"
