import * as React from "react";
import {
  Activity, ArrowLeft, ArrowRight, Bell, Check, CheckCircle2, ChevronRight, Clock3,
  Cloud, Database, GitBranch, History, LayoutDashboard, Link2, List, Mail, Moon,
  MoreHorizontal, Play, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, Timer,
  Workflow as WorkflowIcon, Zap, type LucideIcon
} from "lucide-react";
import {
  Badge, Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, Input, Label, ResponsiveNavigation, Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Toast,
  ToastProvider, useTheme
} from "@design-templates/ui";
import "./relay-workflow-studio.css";

type Page = "Workflows" | "Run history" | "Connections";
type StepKind = "trigger" | "condition" | "action" | "delay";
type WorkflowStep = { id: string; kind: StepKind; title: string; detail: string; app: string };
type WorkflowItem = { id: string; name: string; description: string; status: "Active" | "Draft" | "Paused"; trigger: string; updated: string; lastRun: string; runCount: number; steps: WorkflowStep[] };
type RunItem = { id: string; workflow: string; status: "Succeeded" | "Running" | "Failed"; started: string; duration: string; actor: string };
type DialogType = "create" | "add-step" | null;

const navigation: Array<{ id: Page; icon: LucideIcon }> = [
  { id: "Workflows", icon: WorkflowIcon },
  { id: "Run history", icon: History },
  { id: "Connections", icon: Link2 }
];

const initialWorkflows: WorkflowItem[] = [
  {
    id: "invoice-follow-up", name: "Invoice follow-up", description: "Nudge customers when an invoice passes its due date.", status: "Active", trigger: "Schedule · Every weekday", updated: "8 min ago", lastRun: "Today, 9:42 AM", runCount: 248,
    steps: [
      { id: "invoice-trigger", kind: "trigger", title: "Invoice becomes overdue", detail: "Check every weekday at 9:00 AM", app: "Ledger" },
      { id: "invoice-condition", kind: "condition", title: "Balance is greater than $50", detail: "Continue only when condition matches", app: "Ledger" },
      { id: "invoice-email", kind: "action", title: "Send a friendly reminder", detail: "Email customer with invoice link", app: "Postbird" },
      { id: "invoice-delay", kind: "delay", title: "Wait 3 business days", detail: "Pause before checking again", app: "Relay" },
      { id: "invoice-followup", kind: "action", title: "Create a follow-up task", detail: "Assign to the account owner", app: "Worklist" }
    ]
  },
  {
    id: "new-lead-routing", name: "New lead routing", description: "Route qualified leads to the right account owner.", status: "Active", trigger: "New record · Lead desk", updated: "Yesterday", lastRun: "Today, 8:15 AM", runCount: 91,
    steps: [
      { id: "lead-trigger", kind: "trigger", title: "A new lead is added", detail: "Watch the shared lead list", app: "Lead desk" },
      { id: "lead-condition", kind: "condition", title: "Lead score is above 70", detail: "Continue only when condition matches", app: "Lead desk" },
      { id: "lead-owner", kind: "action", title: "Assign an account owner", detail: "Round-robin across the sales team", app: "Worklist" }
    ]
  },
  {
    id: "weekly-team-digest", name: "Weekly team digest", description: "Share a Monday summary of this week's activity.", status: "Draft", trigger: "Schedule · Monday at 8:30 AM", updated: "Oct 16", lastRun: "Not run yet", runCount: 0,
    steps: [
      { id: "digest-trigger", kind: "trigger", title: "Every Monday morning", detail: "Start at 8:30 AM · workspace time", app: "Relay" },
      { id: "digest-action", kind: "action", title: "Post a team summary", detail: "Include open work and recent wins", app: "Postbird" }
    ]
  },
  {
    id: "payment-received", name: "Payment received", description: "Keep the team in sync when a payment lands.", status: "Paused", trigger: "New event · Ledger", updated: "Oct 14", lastRun: "Oct 13, 2:18 PM", runCount: 37,
    steps: [
      { id: "payment-trigger", kind: "trigger", title: "Payment is received", detail: "Listen for a completed payment", app: "Ledger" },
      { id: "payment-action", kind: "action", title: "Post a payment update", detail: "Share the amount and customer", app: "Postbird" }
    ]
  }
];

const initialRuns: RunItem[] = [
  { id: "run-01", workflow: "Invoice follow-up", status: "Succeeded", started: "Today, 9:42 AM", duration: "1.2 sec", actor: "Scheduled" },
  { id: "run-02", workflow: "New lead routing", status: "Succeeded", started: "Today, 8:15 AM", duration: "0.8 sec", actor: "New record" },
  { id: "run-03", workflow: "Invoice follow-up", status: "Succeeded", started: "Yesterday, 4:05 PM", duration: "1.4 sec", actor: "Scheduled" },
  { id: "run-04", workflow: "Payment received", status: "Failed", started: "Oct 13, 2:18 PM", duration: "—", actor: "Payment event" }
];

const kindMeta: Record<StepKind, { label: string; icon: LucideIcon }> = {
  trigger: { label: "Trigger", icon: Zap },
  condition: { label: "Condition", icon: GitBranch },
  action: { label: "Action", icon: Activity },
  delay: { label: "Delay", icon: Timer }
};

export function RelayWorkflowStudio() {
  return <ToastProvider><WorkflowWorkspace /></ToastProvider>;
}

function WorkflowWorkspace() {
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = React.useState<Page>("Workflows");
  const [screen, setScreen] = React.useState<"list" | "builder">("builder");
  const [workflows, setWorkflows] = React.useState(initialWorkflows);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState(initialWorkflows[0]!.id);
  const [selectedStepId, setSelectedStepId] = React.useState(initialWorkflows[0]!.steps[0]!.id);
  const [runs, setRuns] = React.useState(initialRuns);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All statuses");
  const [dialog, setDialog] = React.useState<DialogType>(null);
  const [draftName, setDraftName] = React.useState("");
  const [stepKind, setStepKind] = React.useState<StepKind>("action");
  const [zoom, setZoom] = React.useState(100);
  const [tidy, setTidy] = React.useState(false);
  const [connections, setConnections] = React.useState<Record<string, boolean>>({ "Postbird": true, "Ledger": true, "Worklist": false, "Cloudsheet": false });
  const [toast, setToast] = React.useState({ open: false, title: "", description: "" });

  const activeWorkflow = workflows.find((item) => item.id === selectedWorkflowId) ?? workflows[0]!;
  const selectedStep = activeWorkflow.steps.find((item) => item.id === selectedStepId) ?? activeWorkflow.steps[0]!;
  const filteredWorkflows = workflows.filter((item) => {
    const matchesQuery = `${item.name} ${item.description} ${item.trigger}`.toLowerCase().includes(query.toLowerCase().trim());
    return matchesQuery && (statusFilter === "All statuses" || item.status === statusFilter);
  });

  function notify(title: string, description = "Sample workspace · changes stay in this session") {
    setToast({ open: true, title, description });
  }

  function openWorkflow(workflow: WorkflowItem) {
    setSelectedWorkflowId(workflow.id);
    setSelectedStepId(workflow.steps[0]?.id ?? "");
    setPage("Workflows");
    setScreen("builder");
  }

  function updateWorkflow(patch: Partial<WorkflowItem>) {
    setWorkflows((current) => current.map((item) => item.id === activeWorkflow.id ? { ...item, ...patch } : item));
  }

  function updateStep(patch: Partial<WorkflowStep>) {
    if (!selectedStep) return;
    updateWorkflow({ steps: activeWorkflow.steps.map((item) => item.id === selectedStep.id ? { ...item, ...patch } : item) });
  }

  function createWorkflow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) {
      notify("Add a workflow name", "Workflow name cannot be blank.");
      return;
    }
    const id = `workflow-${Date.now()}`;
    const workflow: WorkflowItem = {
      id, name, description: "A new automation for your team.", status: "Draft", trigger: "Choose a trigger", updated: "Just now", lastRun: "Not run yet", runCount: 0,
      steps: [{ id: `${id}-trigger`, kind: "trigger", title: "Choose a starting event", detail: "Select what should start this workflow", app: "Relay" }]
    };
    setWorkflows((current) => [workflow, ...current]);
    setSelectedWorkflowId(id);
    setSelectedStepId(workflow.steps[0]!.id);
    setPage("Workflows");
    setScreen("builder");
    setDialog(null);
    setDraftName("");
    notify("Workflow created", "Draft saved in this session · add a trigger to get started");
  }

  function addStep() {
    const defaults: Record<StepKind, Omit<WorkflowStep, "id">> = {
      trigger: { kind: "trigger", title: "Choose a starting event", detail: "Select an event to start this workflow", app: "Relay" },
      condition: { kind: "condition", title: "Add a condition", detail: "Continue when a rule matches", app: "Ledger" },
      action: { kind: "action", title: "Choose an action", detail: "Select what should happen next", app: "Postbird" },
      delay: { kind: "delay", title: "Add a wait step", detail: "Pause before continuing", app: "Relay" }
    };
    const step: WorkflowStep = { id: `step-${Date.now()}`, ...defaults[stepKind] };
    updateWorkflow({ steps: [...activeWorkflow.steps, step] });
    setSelectedStepId(step.id);
    setDialog(null);
    notify(`${kindMeta[stepKind].label} added`, "Configure this sample step in the inspector");
  }

  function runWorkflow() {
    const run: RunItem = { id: `run-${Date.now()}`, workflow: activeWorkflow.name, status: "Succeeded", started: "Just now", duration: "1.1 sec", actor: "Manual test" };
    setRuns((current) => [run, ...current]);
    updateWorkflow({ lastRun: "Just now", runCount: activeWorkflow.runCount + 1 });
    notify("Test run completed", "Sample run succeeded · no connected app was called");
  }

  function setWorkflowEnabled(enabled: boolean) {
    updateWorkflow({ status: enabled ? "Active" : "Paused", updated: "Just now" });
    notify(enabled ? "Workflow activated" : "Workflow paused");
  }

  function switchPage(next: string) {
    if (navigation.some((item) => item.id === next)) {
      setPage(next as Page);
      setScreen("list");
    }
  }

  const mobileItems = navigation.map(({ id, icon: Icon }) => ({ id, label: id, icon: <Icon size={18} aria-hidden="true" /> }));

  return <div className="relay-workflow-studio">
    <div className="rws-app">
      <aside className="rws-sidebar" aria-label="Workspace sidebar">
        <button className="rws-brand" onClick={() => { setPage("Workflows"); setScreen("list"); }} aria-label="Relay workspace home"><span className="rws-brand-mark"><WorkflowIcon size={20} aria-hidden="true" /></span><span>relay<span className="rws-brand-dot">.</span><small>WORKSPACE</small></span></button>
        <button className="rws-workspace-switch" onClick={() => notify("Northstar Studio selected", "This sample contains one local workspace.")}><span className="rws-workspace-avatar">N</span><span><b>Northstar Studio</b><small>Team workspace</small></span><MoreHorizontal size={18} aria-hidden="true" /></button>
        <nav className="rws-navigation" aria-label="Main navigation"><p>WORKSPACE</p>{navigation.map(({ id, icon: Icon }) => <Button key={id} variant="ghost" className={`rws-nav-item${page === id ? " is-active" : ""}`} aria-label={id} aria-current={page === id ? "page" : undefined} onClick={() => switchPage(id)}><Icon size={18} aria-hidden="true" /><span>{id}</span>{id === "Run history" && <span className="rws-nav-count" aria-hidden="true">{runs.length}</span>}</Button>)}</nav>
        <div className="rws-sidebar-bottom"><div className="rws-usage-card"><div><span>Monthly runs</span><b>2,480 <small>/ 5,000</small></b></div><span className="rws-usage-track"><i /></span><span>Plenty of room to automate</span></div><button className="rws-profile" onClick={() => notify("Alex Morgan", "Sample workspace admin · account settings are not connected.")}><span className="rws-profile-avatar">AM</span><span><b>Alex Morgan</b><small>Workspace admin</small></span><MoreHorizontal size={18} aria-hidden="true" /></button></div>
      </aside>

      <div className="rws-main-shell">
        <header className="rws-topbar"><div className="rws-topbar-location"><span>Northstar Studio</span><ChevronRight size={14} aria-hidden="true" /><b>{screen === "builder" ? "Workflow builder" : page}</b></div><div className="rws-topbar-actions"><form className="rws-search" role="search" onSubmit={(event) => event.preventDefault()}><Search size={16} aria-hidden="true" /><Label className="sr-only" htmlFor="rws-search-input">Search workflows</Label><Input id="rws-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workflows" /></form><ResponsiveNavigation items={mobileItems} activeId={page} onSelect={switchPage} label="Open workspace navigation" trigger={<List size={18} aria-hidden="true" />} /><Button variant="ghost" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}</Button><Button variant="ghost" size="icon" aria-label="View sample notifications" onClick={() => notify("You’re all caught up", "Sample workspace notifications") }><Bell size={18} aria-hidden="true" /></Button><span className="rws-top-avatar" aria-label="Alex Morgan">AM</span></div></header>

        <main className="rws-content">
          {screen === "builder" && page === "Workflows" && <>
            <div className="rws-builder-heading"><div className="rws-builder-title"><Button variant="ghost" size="sm" className="rws-back-button" onClick={() => setScreen("list")}><ArrowLeft size={16} aria-hidden="true" /><span>Workflows</span></Button><span className="rws-heading-divider" /><Label className="sr-only" htmlFor="rws-workflow-name">Workflow name</Label><Input id="rws-workflow-name" className="rws-title-input" value={activeWorkflow.name} onChange={(event) => updateWorkflow({ name: event.target.value })} /><Badge className={`rws-status rws-status-${activeWorkflow.status.toLowerCase()}`}><i />{activeWorkflow.status}</Badge></div><div className="rws-builder-actions"><span className="rws-enabled-label">{activeWorkflow.status === "Active" ? "Enabled" : "Disabled"}</span><Switch checked={activeWorkflow.status === "Active"} onCheckedChange={setWorkflowEnabled} aria-label={activeWorkflow.status === "Active" ? "Pause workflow" : "Activate workflow"} /><Button variant="outline" onClick={() => notify("Changes saved", "Workflow saved in this session")}>Save changes</Button><Button onClick={runWorkflow}><Play size={15} aria-hidden="true" />Run now</Button></div></div>
            <div className="rws-builder-subtitle"><span>{activeWorkflow.description}</span><span><Clock3 size={14} aria-hidden="true" />Last edited {activeWorkflow.updated}</span></div>
            <div className="rws-builder-layout">
              <section className={`rws-canvas-panel${tidy ? " is-tidy" : ""}`} aria-label="Workflow canvas">
                <div className="rws-canvas-toolbar"><div><span className="rws-canvas-live"><i />All changes saved</span><span className="rws-canvas-separator" /><span>{activeWorkflow.steps.length} steps</span></div><div className="rws-canvas-tools"><Button variant="ghost" size="sm" onClick={() => setTidy((value) => !value)}><Sparkles size={15} aria-hidden="true" />{tidy ? "Undo tidy" : "Tidy up"}</Button><span className="rws-zoom-control"><Button variant="ghost" size="icon" aria-label="Zoom out" disabled={zoom <= 80} onClick={() => setZoom((value) => Math.max(80, value - 10))}>−</Button><span aria-live="polite">{zoom}%</span><Button variant="ghost" size="icon" aria-label="Zoom in" disabled={zoom >= 120} onClick={() => setZoom((value) => Math.min(120, value + 10))}>+</Button></span></div></div>
                <div className="rws-canvas-scroll"><div className="rws-flow" style={{ "--rws-zoom": zoom } as React.CSSProperties}>
                  {activeWorkflow.steps.map((step, index) => {
                    const MetaIcon = kindMeta[step.kind].icon;
                    return <React.Fragment key={step.id}><button type="button" className={`rws-step-card is-${step.kind}${selectedStep?.id === step.id ? " is-selected" : ""}`} style={{ width: `${Math.round(430 * zoom / 100)}px`, maxWidth: "100%" }} aria-pressed={selectedStep?.id === step.id} onClick={() => setSelectedStepId(step.id)}><span className={`rws-step-icon is-${step.kind}`}><MetaIcon size={18} aria-hidden="true" /></span><span className="rws-step-copy"><span className="rws-step-kind">{kindMeta[step.kind].label}{index === 0 && <span className="rws-step-start">START</span>}</span><strong>{step.title}</strong><span className="rws-step-detail">{step.detail}</span></span><span className="rws-step-app">{step.app}</span><ChevronRight size={16} aria-hidden="true" /></button>{index < activeWorkflow.steps.length - 1 && <div className="rws-flow-connector" aria-hidden="true"><i /></div>}</React.Fragment>;
                  })}
                  <div className="rws-add-step"><span className="rws-flow-connector rws-flow-connector-end" aria-hidden="true"><i /></span><Button variant="outline" size="sm" onClick={() => { setStepKind("action"); setDialog("add-step"); }}><Plus size={15} aria-hidden="true" />Add a step</Button></div>
                </div></div>
                <div className="rws-canvas-footer"><span><ShieldCheck size={15} aria-hidden="true" />Sample workflow · no live apps connected</span><Button variant="ghost" size="sm" onClick={() => setZoom(100)}>Fit to screen</Button></div>
              </section>

              <aside className="rws-inspector" aria-label="Step inspector"><div className="rws-inspector-heading"><span className="rws-inspector-icon"><Settings2 size={17} aria-hidden="true" /></span><div><h2>Step settings</h2><p>Configure this workflow step</p></div><Button variant="ghost" size="icon" aria-label="More step options" onClick={() => notify("Step options", "Sample step settings") }><MoreHorizontal size={18} aria-hidden="true" /></Button></div>
                {selectedStep ? <Tabs defaultValue="setup" className="rws-inspector-tabs"><TabsList aria-label="Inspector sections"><TabsTrigger value="setup">Setup</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="setup" className="rws-inspector-content"><Badge className={`rws-kind-badge is-${selectedStep.kind}`}><span className="rws-kind-dot" />{kindMeta[selectedStep.kind].label}</Badge><Label htmlFor="rws-step-title">Step name</Label><Input id="rws-step-title" value={selectedStep.title} onChange={(event) => updateStep({ title: event.target.value })} /><Label htmlFor="rws-step-detail">Instructions</Label><Input id="rws-step-detail" value={selectedStep.detail} onChange={(event) => updateStep({ detail: event.target.value })} /><Label htmlFor="rws-step-app">App connection</Label><Select value={selectedStep.app} onValueChange={(app) => updateStep({ app })}><SelectTrigger id="rws-step-app"><SelectValue /></SelectTrigger><SelectContent>{["Relay", "Ledger", "Postbird", "Worklist", "Cloudsheet"].map((app) => <SelectItem key={app} value={app}>{app}</SelectItem>)}</SelectContent></Select><div className="rws-inspector-note"><CheckCircle2 size={16} aria-hidden="true" /><span><b>Ready to test</b><small>Sample settings are saved in this session only.</small></span></div></TabsContent><TabsContent value="activity" className="rws-inspector-content"><div className="rws-activity-empty"><History size={21} aria-hidden="true" /><b>No step activity yet</b><span>Run this workflow to see sample activity here.</span><Button variant="outline" size="sm" onClick={runWorkflow}><Play size={14} aria-hidden="true" />Test workflow</Button></div></TabsContent></Tabs> : <p className="rws-inspector-empty">Select a step on the canvas to configure it.</p>}
              </aside>
            </div>
          </>}

          {screen === "list" && page === "Workflows" && <WorkflowList workflows={filteredWorkflows} total={workflows.length} activeCount={workflows.filter((item) => item.status === "Active").length} statusFilter={statusFilter} onFilter={setStatusFilter} onOpen={openWorkflow} onCreate={() => { setDraftName(""); setDialog("create"); }} />}
          {screen === "list" && page === "Run history" && <RunHistory runs={runs} onOpen={(name) => { const item = workflows.find((workflow) => workflow.name === name); if (item) openWorkflow(item); }} />}
          {screen === "list" && page === "Connections" && <Connections connections={connections} onToggle={(name) => { const connected = !connections[name]; setConnections((current) => ({ ...current, [name]: connected })); notify(connected ? `${name} connected` : `${name} disconnected`, "Connection state is a local sample"); }} />}
        </main>
        <footer className="rws-footer"><span>Relay sample workspace</span><span><Cloud size={14} aria-hidden="true" />Local preview · changes reset on reload</span></footer>
      </div>
    </div>

    <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
      <DialogContent className="rws-dialog" aria-describedby="rws-dialog-description">
        <DialogHeader><DialogTitle>{dialog === "create" ? "Create a workflow" : "Add a step"}</DialogTitle><DialogDescription id="rws-dialog-description">{dialog === "create" ? "Start with a name. You can choose a trigger in the builder." : "Choose what should happen next in this sample workflow."}</DialogDescription></DialogHeader>
        {dialog === "create" && <form className="rws-dialog-form" onSubmit={createWorkflow}><Label htmlFor="rws-new-workflow-name">Workflow name</Label><Input id="rws-new-workflow-name" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="e.g. Welcome new customers" maxLength={80} required /><DialogFooter><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit"><Plus size={15} aria-hidden="true" />Create workflow</Button></DialogFooter></form>}
        {dialog === "add-step" && <div className="rws-step-picker"><Label htmlFor="rws-step-kind">Step type</Label><Select value={stepKind} onValueChange={(value) => setStepKind(value as StepKind)}><SelectTrigger id="rws-step-kind"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="condition">Condition</SelectItem><SelectItem value="action">Action</SelectItem><SelectItem value="delay">Delay</SelectItem></SelectContent></Select><p>New steps are sample-only and can be edited from the inspector.</p><DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={addStep}><Plus size={15} aria-hidden="true" />Add {kindMeta[stepKind].label.toLowerCase()}</Button></DialogFooter></div>}
      </DialogContent>
    </Dialog>
    <Toast {...toast} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </div>;
}

function WorkflowList({ workflows, total, activeCount, statusFilter, onFilter, onOpen, onCreate }: { workflows: WorkflowItem[]; total: number; activeCount: number; statusFilter: string; onFilter: (value: string) => void; onOpen: (workflow: WorkflowItem) => void; onCreate: () => void }) {
  return <section className="rws-list-page" aria-labelledby="rws-workflows-title"><div className="rws-page-heading"><div><p className="rws-eyebrow">AUTOMATION</p><h1 id="rws-workflows-title">Workflows</h1><p>Build reliable routines for the work your team does every day.</p></div><Button onClick={onCreate}><Plus size={16} aria-hidden="true" />Create workflow</Button></div>
    <div className="rws-stats-grid"><Card className="rws-stat-card"><span className="rws-stat-icon is-indigo"><WorkflowIcon size={18} aria-hidden="true" /></span><span><small>Total workflows</small><b>{total}</b><em>Across this workspace</em></span></Card><Card className="rws-stat-card"><span className="rws-stat-icon is-green"><Activity size={18} aria-hidden="true" /></span><span><small>Active workflows</small><b>{activeCount}</b><em>Ready to run</em></span></Card><Card className="rws-stat-card"><span className="rws-stat-icon is-amber"><Play size={18} aria-hidden="true" /></span><span><small>Runs this month</small><b>2,480</b><em>Across all automations</em></span></Card></div>
    <div className="rws-list-toolbar"><div><div><h2>Your workflows</h2><span>{workflows.length} shown</span></div><p>Manage automations and see when they last ran.</p></div><div className="rws-list-controls"><Label className="sr-only" htmlFor="rws-status-filter">Filter workflows by status</Label><Select value={statusFilter} onValueChange={onFilter}><SelectTrigger id="rws-status-filter"><List size={15} aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent>{["All statuses", "Active", "Draft", "Paused"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="sm" onClick={onCreate}><Plus size={15} aria-hidden="true" />New workflow</Button></div></div>
    {workflows.length ? <div className="rws-workflow-table-wrap"><table className="rws-workflow-table"><thead><tr><th>Workflow</th><th>Trigger</th><th>Status</th><th>Last run</th><th>Runs</th><th><span className="sr-only">Open</span></th></tr></thead><tbody>{workflows.map((workflow) => <tr key={workflow.id}><td><button className="rws-workflow-link" onClick={() => onOpen(workflow)}><span className="rws-workflow-icon"><WorkflowIcon size={17} aria-hidden="true" /></span><span><b>{workflow.name}</b><small>{workflow.description}</small></span></button></td><td><span className="rws-trigger-cell"><Zap size={14} aria-hidden="true" />{workflow.trigger}</span></td><td><Badge className={`rws-status rws-status-${workflow.status.toLowerCase()}`}><i />{workflow.status}</Badge></td><td>{workflow.lastRun}</td><td>{workflow.runCount}</td><td><Button variant="ghost" size="icon" aria-label={`Open ${workflow.name}`} onClick={() => onOpen(workflow)}><ArrowRight size={16} aria-hidden="true" /></Button></td></tr>)}</tbody></table></div> : <div className="rws-empty"><Search size={22} aria-hidden="true" /><h2>No workflows found</h2><p>Try another search or status filter.</p><Button variant="outline" size="sm" onClick={() => onFilter("All statuses")}>Show all workflows</Button></div>}
    <div className="rws-list-note"><ShieldCheck size={15} aria-hidden="true" /><span>Sample workspace · workflow changes stay in this browser session.</span></div>
  </section>;
}

function RunHistory({ runs, onOpen }: { runs: RunItem[]; onOpen: (name: string) => void }) {
  return <section className="rws-secondary-page" aria-labelledby="rws-runs-title"><div className="rws-page-heading"><div><p className="rws-eyebrow">MONITORING</p><h1 id="rws-runs-title">Run history</h1><p>Recent activity from your sample workflow workspace.</p></div><Badge className="rws-history-total"><Activity size={14} aria-hidden="true" />{runs.length} recent runs</Badge></div><Card className="rws-run-card"><div className="rws-table-heading"><div><h2>Recent runs</h2><p>Run details are local sample data.</p></div><Button variant="outline" size="sm" onClick={() => onOpen(runs[0]?.workflow ?? "")}>Open latest workflow<ArrowRight size={14} aria-hidden="true" /></Button></div><div className="rws-run-table-wrap"><table className="rws-run-table"><thead><tr><th>Workflow</th><th>Status</th><th>Started</th><th>Duration</th><th>Started by</th></tr></thead><tbody>{runs.map((run) => <tr key={run.id}><td><button className="rws-run-link" onClick={() => onOpen(run.workflow)}>{run.workflow}<ArrowRight size={14} aria-hidden="true" /></button></td><td><Badge className={`rws-run-status is-${run.status.toLowerCase()}`}><i />{run.status}</Badge></td><td>{run.started}</td><td>{run.duration}</td><td>{run.actor}</td></tr>)}</tbody></table></div></Card><div className="rws-list-note"><Clock3 size={15} aria-hidden="true" /><span>Example run records · no external services were contacted.</span></div></section>;
}

function Connections({ connections, onToggle }: { connections: Record<string, boolean>; onToggle: (name: string) => void }) {
  const apps: Array<{ name: string; detail: string; icon: LucideIcon; accent: string }> = [
    { name: "Postbird", detail: "Send team updates and customer email.", icon: Mail, accent: "violet" },
    { name: "Ledger", detail: "Keep invoices and payment events in sync.", icon: Database, accent: "green" },
    { name: "Worklist", detail: "Create tasks and route work to teammates.", icon: Check, accent: "blue" },
    { name: "Cloudsheet", detail: "Read and update shared team records.", icon: Cloud, accent: "amber" }
  ];
  return <section className="rws-secondary-page" aria-labelledby="rws-connections-title"><div className="rws-page-heading"><div><p className="rws-eyebrow">APP LIBRARY</p><h1 id="rws-connections-title">Connections</h1><p>Manage the apps your sample workflows can work with.</p></div><Badge className="rws-history-total"><Link2 size={14} aria-hidden="true" />{Object.values(connections).filter(Boolean).length} connected</Badge></div><div className="rws-connection-grid">{apps.map(({ name, detail, icon: Icon, accent }) => <Card className="rws-connection-card" key={name}><span className={`rws-connection-icon is-${accent}`}><Icon size={19} aria-hidden="true" /></span><div className="rws-connection-copy"><h2>{name}</h2><p>{detail}</p><span className={connections[name] ? "is-connected" : "is-disconnected"}><i />{connections[name] ? "Connected" : "Not connected"}</span></div><Button variant={connections[name] ? "outline" : "primary"} size="sm" onClick={() => onToggle(name)}>{connections[name] ? "Disconnect" : "Connect"}</Button></Card>)}</div><div className="rws-list-note"><Cloud size={15} aria-hidden="true" /><span>Connection controls are illustrative; no sign-in or network request is performed.</span></div></section>;
}

export default RelayWorkflowStudio;
