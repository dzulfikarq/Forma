import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger
} from "@design-templates/ui";
import "./focus-planner.css";

type Task = { id: number; title: string; detail: string; done: boolean };
type Filter = "all" | "open" | "done";

const initialTasks: Task[] = [
  { id: 1, title: "Review project brief", detail: "Studio refresh · 9:30 AM", done: true },
  { id: 2, title: "Prepare launch notes", detail: "Website launch · 11:00 AM", done: false },
  { id: 3, title: "Send feedback to Maya", detail: "Brand review · 2:00 PM", done: false }
];

export function FocusPlanner() {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const completed = tasks.filter((task) => task.done).length;
  const visibleTasks = tasks.filter((task) => filter === "all" || (filter === "done" ? task.done : !task.done));

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setTasks((current) => [...current, { id: Date.now(), title: cleanTitle, detail: "Added just now", done: false }]);
    setTitle("");
    setDialogOpen(false);
    setFilter("all");
  }

  function toggleTask(id: number, done: boolean) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done } : task));
  }

  return <main className="focus-planner" aria-labelledby="planner-title">
    <div className="planner-shell">
      <header className="planner-header">
        <div className="planner-brand"><span aria-hidden="true">f</span><span>daymark<small>YOUR DAILY SPACE</small></span></div>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>Add task</Button>
      </header>

      <section className="planner-intro">
        <p className="planner-eyebrow">TUESDAY, OCTOBER 14</p>
        <h1 id="planner-title">Make room for what matters.</h1>
        <p>A little focus goes a long way. Here’s your day, one step at a time.</p>
      </section>

      <section className="planner-summary" aria-label="Daily progress">
        <Card className="summary-card summary-primary"><CardContent className="summary-card-content"><span>Today’s progress</span><strong>{completed} <small>/ {tasks.length}</small></strong><span>{tasks.length - completed} tasks left</span></CardContent></Card>
        <Card className="summary-card"><CardContent className="summary-card-content"><span>Focus time</span><strong>2h 40m</strong><span>Across 3 sessions</span></CardContent></Card>
        <Card className="summary-card"><CardContent className="summary-card-content"><span>Daily streak</span><strong>6 days</strong><span>You’re finding your rhythm</span></CardContent></Card>
      </section>

      <section className="planner-tasks" aria-labelledby="task-list-heading">
        <div className="task-heading"><div><p className="planner-eyebrow">YOUR PLAN</p><h2 id="task-list-heading">Today’s tasks</h2></div><Button onClick={() => setDialogOpen(true)}>Add task</Button></div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList aria-label="Filter tasks">
            <TabsTrigger value="all">All <span>{tasks.length}</span></TabsTrigger>
            <TabsTrigger value="open">To do <span>{tasks.length - completed}</span></TabsTrigger>
            <TabsTrigger value="done">Done <span>{completed}</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <Card className="task-list-card"><CardContent className="task-list-content">
          {visibleTasks.length ? <ul className="task-list">{visibleTasks.map((task) => <li className={task.done ? "task-item is-done" : "task-item"} key={task.id}>
            <Checkbox aria-label={`Mark ${task.title} complete`} checked={task.done} onCheckedChange={(checked) => toggleTask(task.id, checked === true)} />
            <span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
            <span className="task-marker" aria-hidden="true" />
          </li>)}</ul> : <p className="task-empty">Nothing in this view. Add a task when you’re ready.</p>}
        </CardContent></Card>
        <p className="planner-note">Sample tasks are local to this preview and reset when you reload.</p>
      </section>
    </div>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent aria-describedby="add-task-description">
        <DialogHeader><DialogTitle>Add a task</DialogTitle><DialogDescription id="add-task-description">Keep it small and give it a clear next step.</DialogDescription></DialogHeader>
        <form onSubmit={addTask}>
          <Label htmlFor="new-task-title">Task name</Label>
          <Input id="new-task-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" required maxLength={100} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Add task</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </main>;
}

export default FocusPlanner;
