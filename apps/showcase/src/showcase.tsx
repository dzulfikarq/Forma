import * as React from "react";
import { MotionConfig, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Code2, Command, ExternalLink, Layers3, LayoutGrid, Maximize2, Moon, Search, Sun, WandSparkles } from "lucide-react";
import {
  Badge, Breadcrumb, Button, Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, EmptyState, Input, Label, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Toast, ToastProvider, TooltipProvider,
  useTheme, ThemeProvider
} from "@design-templates/ui";
import { getCategoryName, registry, type Template } from "./registry";

type View = "gallery" | "detail" | "components";
type Device = "desktop" | "tablet" | "mobile";
const modules = import.meta.glob<React.ComponentType>("../../../templates/*/src/entry.tsx", { import: "default" });
const components = Object.fromEntries(Object.entries(modules).map(([path, load]) => [path.split("/").at(-3), React.lazy(() => load().then((component) => ({ default: component })))]));
const ComponentShowcase = React.lazy(() => import("./component-showcase").then(({ ComponentShowcase }) => ({ default: ComponentShowcase })));

function hexToHsl(hex: string) {
  const [red, green, blue] = hex.match(/[a-f\d]{2}/gi)!.map((part) => parseInt(part, 16) / 255);
  const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta) hue = max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function App() {
  const params = new URLSearchParams(window.location.search);
  const previewId = params.get("template-preview");
  if (previewId) return <ThemeProvider defaultTheme={params.get("theme") === "light" ? "light" : "dark"} defaultAccent={params.get("accent") ?? "24 95% 53%"}><TemplatePreviewRunner templateId={previewId} Preview={components[previewId]} /></ThemeProvider>;
  return <ThemeProvider defaultTheme="light" defaultAccent="263 83% 62%"><ToastProvider><TooltipProvider><Showcase /></TooltipProvider></ToastProvider></ThemeProvider>;
}

function TemplatePreviewRunner({ templateId, Preview }: { templateId: string; Preview?: React.LazyExoticComponent<React.ComponentType> }) {
  return <div className="template-preview-runner" data-template-preview-id={templateId}>{Preview ? <React.Suspense fallback={<p>Loading template preview</p>}><Preview /></React.Suspense> : <p role="alert">Template entry unavailable: {templateId}</p>}</div>;
}

function Showcase() {
  const [view, setView] = React.useState<View>("gallery");
  const [activeTemplateId, setActiveTemplateId] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [device, setDevice] = React.useState<Device>("desktop");
  const [toast, setToast] = React.useState({ open: false, title: "", description: "" });
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const { theme, toggleTheme, setAccent } = useTheme();
  const activeTemplate = registry.templates.find((item) => item.id === activeTemplateId) ?? null;
  const filteredTemplates = registry.templates.filter((template) => (category === "all" || template.category === category) && `${template.name} ${template.description} ${template.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  React.useEffect(() => {
    function focusGallerySearch(event: KeyboardEvent) {
      if (view !== "gallery" || (!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", focusGallerySearch);
    return () => window.removeEventListener("keydown", focusGallerySearch);
  }, [view]);

  function openTemplate(template: Template) {
    setActiveTemplateId(template.id);
    setAccent(template.variants.find((variant) => variant.default)?.accent ?? "24 95% 53%");
    setDevice("desktop");
    setView("detail");
  }
  function backToGallery() { setView("gallery"); setActiveTemplateId(null); }

  return <MotionConfig reducedMotion="user"><div className="showcase-shell min-h-screen bg-background text-foreground">
    <header className="showcase-header"><button className="showcase-brand" onClick={backToGallery} aria-label="Forma home"><span className="showcase-logo"><Layers3 size={17} /></span><span>forma<span className="brand-period">.</span><small>DESIGN TEMPLATES</small></span></button><nav className="header-links"><button className={view === "gallery" || view === "detail" ? "selected" : ""} onClick={backToGallery}>Templates <span>{registry.templates.length.toString().padStart(2, "0")}</span></button><button className={view === "components" ? "selected" : ""} onClick={() => setView("components")}>Components</button></nav><div className="header-right"><span className="registry-status"><i />{registry.distribution.immutable ? registry.distribution.ref : "Local registry"}</span><Button className="header-theme" variant="ghost" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</Button><a className="github-link" href={registry.distribution.repository} target="_blank" rel="noreferrer" aria-label="Open repository on GitHub"><ExternalLink size={15} /></a></div></header>
    <main>
      {view === "gallery" && <Gallery query={query} setQuery={setQuery} searchRef={searchRef} category={category} setCategory={setCategory} templates={filteredTemplates} openTemplate={openTemplate} />}
      {view === "detail" && activeTemplate && <TemplateDetail template={activeTemplate} device={device} setDevice={setDevice} goBack={backToGallery} notify={(title, description) => setToast({ open: true, title, description })} />}
      {view === "components" && <React.Suspense fallback={<p role="status">Loading components…</p>}><ComponentShowcase notify={(title, description) => setToast({ open: true, title, description })} /></React.Suspense>}
    </main>
    <footer className="showcase-footer"><span>Forma <i>·</i> reusable React templates</span><span>V1 <i>·</i> generated from validated metadata</span></footer>
    <Toast {...toast} onOpenChange={(open) => setToast((current) => ({ ...current, open }))} />
  </div></MotionConfig>;
}

function Gallery({ query, setQuery, searchRef, category, setCategory, templates, openTemplate }: { query: string; setQuery: (query: string) => void; searchRef: React.RefObject<HTMLInputElement | null>; category: string; setCategory: (category: string) => void; templates: Template[]; openTemplate: (template: Template) => void }) {
  const frameworks = Array.from(new Set(registry.templates.flatMap((template) => template.compatibility.map((item) => item.framework)))).sort();

  return <div className="gallery-page">
    <section className="gallery-hero">
      <div className="hero-copy">
        <div className="hero-kicker"><span className="hero-spark"><WandSparkles size={13} /></span>Thoughtful interfaces, ready to build</div>
        <h1>Less setup.<br /><span>More good design.</span></h1>
        <p>Production-minded React templates built on a shared design system. Browse, preview, and adapt with confidence.</p>
        <div className="hero-proof"><span><i>✓</i> Token-driven</span><span><i>✓</i> Responsive by default</span><span><i>✓</i> Built for real workflows</span></div>
        <div className="registry-summary" aria-label={`${registry.templates.length} templates, ${registry.categories.length} categories, ${frameworks.length} frameworks`}>
          <div><span className="summary-icon"><Layers3 size={16} aria-hidden="true" /></span><span><b>{registry.templates.length}</b><small>templates</small></span></div>
          <span className="summary-divider" aria-hidden="true" />
          <div><span className="summary-icon"><LayoutGrid size={16} aria-hidden="true" /></span><span><b>{registry.categories.length}</b><small>categories</small></span></div>
          <span className="summary-divider" aria-hidden="true" />
          <div className="summary-frameworks"><span className="summary-icon"><Code2 size={16} aria-hidden="true" /></span><span><b>{frameworks.length} frameworks</b><small>{frameworks.join(" · ") || "No framework metadata"}</small></span></div>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-preview-card"><div className="mini-sidebar"><i /><i /><i /><i /><i /></div><div className="mini-content"><div className="mini-top"><i /><i /></div><b>Good morning, Noor</b><span>Heartwell today</span><div className="mini-stats"><i /><i /><i /></div><div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div className="hero-glow" /></div><div className="hero-floating hero-float-one"><span className="float-dot" /> {frameworks[0] ?? "Forma templates"}</div><div className="hero-floating hero-float-two"><Check size={13} /> Responsive · token-driven</div></div>
    </section>
    <section className="catalog-section" aria-labelledby="catalog-heading">
      <div className="catalog-head"><div><p className="section-eyebrow">THE LIBRARY</p><h2 id="catalog-heading">Explore templates <span>{registry.templates.length}</span></h2></div><div className="catalog-search"><Search size={17} aria-hidden="true" /><label htmlFor="template-search" className="sr-only">Search templates</label><Input ref={searchRef} id="template-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates or tags" /><kbd><Command size={12} aria-hidden="true" /> K</kbd></div></div>
      <div className="catalog-controls"><div className="category-filters" role="group" aria-label="Filter by category"><button type="button" className={category === "all" ? "active" : ""} aria-pressed={category === "all"} onClick={() => setCategory("all")}>All templates <span>{registry.templates.length}</span></button>{registry.categories.map((item) => <button type="button" key={item.id} className={category === item.id ? "active" : ""} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.name}</button>)}</div><span className="sort-label" aria-live="polite">{templates.length} {templates.length === 1 ? "template" : "templates"}</span></div>
      {templates.length ? <div className="template-grid">{templates.map((template, index) => <TemplateCard key={template.id} template={template} index={index} openTemplate={openTemplate} />)}</div> : <EmptyState title="No templates found" description="Try a different name, tag, or category." action={<Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</Button>} />}
    </section>
  </div>;
}

function getCompatibilityStatus(template: Template) {
  const tested = template.compatibility.filter((item) => item.status === "tested").length;
  const total = template.compatibility.length;
  return { tested: total > 0 && tested === total, label: !tested ? "Untested" : tested === total ? "Tested" : `${tested} of ${total} tested` };
}

function TemplateCard({ template, index, openTemplate }: { template: Template; index: number; openTemplate: (template: Template) => void }) {
  const compatibility = getCompatibilityStatus(template);
  return <motion.button className="template-card" data-template-id={template.id} onClick={() => openTemplate(template)} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18, delay: Math.min(index * .015, .12) }} whileHover={{ y: -2 }}><div className="template-preview"><img src={template.preview} alt={`${template.name} template preview`} loading="lazy" /><span className="preview-hover">Open live preview <ArrowRight size={14} aria-hidden="true" /></span><span className="preview-version">v{template.version}</span></div><div className="template-card-info"><div className="template-card-title"><div><div className="template-card-overline"><span className="template-category">{getCategoryName(template.category, registry.categories)}</span><span className={`compatibility-pill${compatibility.tested ? " is-tested" : ""}`}><i aria-hidden="true" />{compatibility.label}</span></div><h3>{template.name}</h3></div><span className="open-arrow" aria-hidden="true"><ArrowRight size={15} /></span></div><p>{template.description}</p><div className="template-card-bottom"><div className="tag-list">{template.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><span className="variant-count">{template.variants.length} theme{template.variants.length === 1 ? "" : "s"}</span></div></div></motion.button>;
}

function TemplateDetail({ template, device, setDevice, goBack, notify }: { template: Template; device: Device; setDevice: (device: Device) => void; goBack: () => void; notify: (title: string, description: string) => void }) {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const Preview = components[template.id];
  const [variantId, setVariantId] = React.useState(template.variants.find((variant) => variant.default)?.id ?? template.variants[0]?.id);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const activeVariant = template.variants.find((variant) => variant.id === variantId) ?? template.variants[0];
  const compatibility = getCompatibilityStatus(template);
  const width = device === "desktop" ? "100%" : device === "tablet" ? "820px" : "375px";
  const deviceSwitcher = <div className="device-switcher" role="group" aria-label="Preview viewport">{(["desktop", "tablet", "mobile"] as const).map((option) => <button type="button" key={option} className={device === option ? "active" : ""} aria-label={`${option} preview`} aria-pressed={device === option} onClick={() => setDevice(option)} title={`${option} preview`}>{option === "desktop" ? <DesktopIcon /> : option === "tablet" ? <TabletIcon /> : <MobileIcon />}<span>{option}</span></button>)}</div>;

  React.useEffect(() => { if (activeVariant) setAccent(activeVariant.accent); }, [activeVariant, setAccent]);
  return <div className="detail-page"><div className="detail-toolbar"><Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft size={15} />All templates</Button><span className="toolbar-divider" /><Breadcrumb className="detail-breadcrumb" items={[{ label: getCategoryName(template.category, registry.categories) }, { label: template.name }]} /><div className="detail-toolbar-right"><Badge className="detail-version-badge">v{template.version}</Badge><span className={`compatibility-mark${compatibility.tested ? " is-tested" : " is-untested"}`}><i aria-hidden="true" />{compatibility.label}</span></div></div>
    <div className="detail-layout"><aside className="detail-sidebar"><p className="section-eyebrow">TEMPLATE</p><h1>{template.name}</h1><p className="detail-description">{template.description}</p><div className="detail-metadata"><div><span>Category</span><b>{getCategoryName(template.category, registry.categories)}</b></div><div><span>Version</span><b>{template.version}</b></div><div><span>License</span><b>{template.license.type}</b></div><div><span>Compatibility</span><b>{template.compatibility.map((item) => `${item.framework} (${item.status})`).join(", ")}</b></div></div><div className="variant-picker"><Label htmlFor="theme-variant">Theme variant</Label><Select value={variantId} onValueChange={(id) => { setVariantId(id); const variant = template.variants.find((item) => item.id === id); if (variant) setAccent(variant.accent); }}><SelectTrigger id="theme-variant"><SelectValue /></SelectTrigger><SelectContent>{template.variants.map((variant) => <SelectItem key={variant.id} value={variant.id}><span className="variant-select-label"><i style={{ background: `hsl(${variant.accent})` }} />{variant.name}</span></SelectItem>)}</SelectContent></Select></div><div className="accent-picker"><Label>Accent color</Label><div>{template.variants.map((variant) => <button key={variant.id} style={{ background: `hsl(${variant.accent})` }} className={accent === variant.accent ? "selected" : ""} aria-label={`${variant.name} accent`} onClick={() => { setVariantId(variant.id); setAccent(variant.accent); }} />)}<label className="custom-accent" title="Choose custom accent"><input type="color" aria-label="Custom accent color" onChange={(event) => setAccent(hexToHsl(event.target.value))} /><PlusIcon /></label></div></div><div className="detail-theme-control"><span>Preview mode</span><Button variant="outline" size="sm" onClick={toggleTheme}>{theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}{theme === "dark" ? "Dark" : "Light"}</Button></div><Button className="detail-share" onClick={() => document.querySelector(".preview-stage")?.scrollIntoView({ block: "center" })}>Jump to live preview <ArrowRight size={15} /></Button><p className="detail-footnote">Mock data · No backend · {template.dependencies.length} dependencies</p></aside>
      <section className="detail-preview-area"><div className="preview-toolbar"><div><span className="preview-live-dot" />Live preview <span className="preview-frame-label">{device} · {device === "desktop" ? "fluid width" : width}</span></div><div className="preview-toolbar-actions">{deviceSwitcher}<Button variant="outline" size="sm" className="preview-expand" aria-label="Open large preview" onClick={() => setPreviewOpen(true)}><Maximize2 size={15} />Expand</Button></div></div><div className="preview-stage"><div className={`preview-viewport preview-${device}`} style={{ width }} key={`${device}-${template.id}`}>{Preview ? <React.Suspense fallback={<div className="preview-missing"><Layers3 size={28} /><b>Loading template preview</b></div>}><Preview /></React.Suspense> : <div className="preview-missing"><Layers3 size={28} /><b>Preview source unavailable</b><span>Registry metadata exists, but template entry could not load.</span></div>}</div></div><div className="preview-caption"><span>Interactive preview — changes are local and reset on reload.</span><span><i /> Responsive layout</span></div></section><Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="preview-dialog" aria-describedby="expanded-preview-description"><DialogHeader className="preview-dialog-header"><DialogTitle>{template.name} preview</DialogTitle><DialogDescription id="expanded-preview-description">Interactive template preview. Changes remain local to this session.</DialogDescription></DialogHeader><div className="preview-expanded-toolbar">{deviceSwitcher}<span className="preview-frame-label">{device} · {device === "desktop" ? "fluid width" : width}</span></div><div className="preview-expanded-stage"><div className={`preview-viewport preview-${device}`} style={{ width, maxWidth: "100%" }} key={`expanded-${device}-${template.id}`}>{Preview ? <React.Suspense fallback={<div className="preview-missing"><Layers3 size={28} /><b>Loading template preview</b></div>}><Preview /></React.Suspense> : <div className="preview-missing"><Layers3 size={28} /><b>Preview source unavailable</b><span>Registry metadata exists, but template entry could not load.</span></div>}</div></div></DialogContent></Dialog></div>
  </div>;
}

function PlusIcon() { return <span aria-hidden="true">+</span>; }
function DesktopIcon() { return <svg viewBox="0 0 20 16" aria-hidden="true"><rect x="1" y="1" width="18" height="12" rx="2" /><path d="M7 15h6M10 13v2" /></svg>; }
function TabletIcon() { return <svg viewBox="0 0 14 18" aria-hidden="true"><rect x="1" y="1" width="12" height="16" rx="2" /><path d="M6 14.5h2" /></svg>; }
function MobileIcon() { return <svg viewBox="0 0 11 18" aria-hidden="true"><rect x="1" y="1" width="9" height="16" rx="2" /><path d="M4.5 14.5h2" /></svg>; }
