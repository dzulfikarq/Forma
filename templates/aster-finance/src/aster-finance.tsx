import * as React from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, CreditCard, Menu, PiggyBank,
  ShieldCheck, Smartphone, Sparkles, Star, TrendingUp, Wallet, X,
  type LucideIcon
} from "lucide-react";
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent,
  DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Toast,
  ToastProvider
} from "@design-templates/ui";
import "./aster-finance.css";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Stories", href: "#stories" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

const plans = [
  { id: "starter", name: "Starter", monthly: 0, yearly: 0, note: "A clear first step", features: ["One money overview", "Monthly spending plan", "Three savings goals"] },
  { id: "everyday", name: "Everyday", monthly: 18, yearly: 15, note: "For steady routines", features: ["Everything in Starter", "Flexible budget categories", "Monthly progress notes"] },
  { id: "insight", name: "Insight", monthly: 34, yearly: 28, note: "For the bigger picture", features: ["Everything in Everyday", "Long-range goal views", "Priority sample support"] }
] as const;

type PlanId = typeof plans[number]["id"];

const testimonials = [
  { name: "Maya Bennett", role: "Independent designer", initials: "MB", quote: "I finally have a simple place to see what is coming up and what I want to save for next." },
  { name: "Elliot Park", role: "Studio co-founder", initials: "EP", quote: "The monthly view makes the small decisions feel a lot less noisy. I can focus on the plan." },
  { name: "Rina Patel", role: "Community organizer", initials: "RP", quote: "I like that goals feel flexible. It feels more like a helpful routine than another spreadsheet." },
  { name: "Theo Martin", role: "Freelance photographer", initials: "TM", quote: "Seeing bills and savings side by side gives me a calmer start to each month." }
];

const articles = [
  { category: "Everyday money", date: "6 min read", title: "A gentle way to reset your monthly budget", summary: "Start with what matters this month, make room for the essentials, then give the rest of your money a clear next step." },
  { category: "Saving habits", date: "4 min read", title: "Make a savings goal feel achievable", summary: "Turn a big future plan into a few small milestones you can revisit without pressure." },
  { category: "Money basics", date: "8 min read", title: "Build a buffer for irregular income", summary: "A practical framework for planning around work and income that do not arrive on the same schedule." }
];

const faqs = [
  { question: "What can I explore in this preview?", answer: "This is a front-end design sample. You can explore the page, pricing toggle, FAQ, article details, and signup dialog. No account or financial connection is created." },
  { question: "Does Aster connect to my bank?", answer: "No. The product screens and figures are illustrative only. This template has no bank integration, account, or financial service behind it." },
  { question: "Can I change plans later?", answer: "The plans are sample content for the landing page. The preview does not start a subscription or collect payment details." },
  { question: "How does the signup form work?", answer: "It demonstrates local form validation and confirmation feedback. Information stays in the current preview and is not sent or saved." }
];

const features: Array<{ title: string; description: string; icon: LucideIcon }> = [
  { title: "Spending, made visible", description: "Bring everyday purchases into one clear monthly view.", icon: CreditCard },
  { title: "Goals that fit your life", description: "Give the plans you care about a flexible place to grow.", icon: PiggyBank },
  { title: "A useful bigger picture", description: "Notice patterns with simple, readable summaries.", icon: BarChart3 },
  { title: "Thoughtful by design", description: "Keep the experience clear about what is sample and what is real.", icon: ShieldCheck }
];

function AsterMark({ size = 19 }: { size?: number }) {
  return <span className="af-brand-mark"><Sparkles size={size} aria-hidden="true" /></span>;
}

export function AsterFinance() {
  return <ToastProvider><AsterFinanceLanding /></ToastProvider>;
}

function AsterFinanceLanding() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [annualBilling, setAnnualBilling] = React.useState(false);
  const [signupOpen, setSignupOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<PlanId>("starter");
  const [selectedArticle, setSelectedArticle] = React.useState<(typeof articles)[number] | null>(null);
  const [testimonialStart, setTestimonialStart] = React.useState(0);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toast, setToast] = React.useState({ title: "", description: "" });

  function notify(title: string, description: string) {
    setToast({ title, description });
    setToastOpen(true);
  }

  function openSignup(plan: PlanId = "starter") {
    setSelectedPlan(plan);
    setSignupOpen(true);
    setMenuOpen(false);
  }

  function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name")?.toString().trim().split(/\s+/)[0] || "there";
    setSignupOpen(false);
    notify(`Thanks, ${name}`, "Your details stay in this local preview. Nothing was sent or saved.");
  }

  function openStoreNotice(platform: string) {
    notify(`${platform} preview`, "There is no app download connected to this design sample.");
  }

  const visibleTestimonials = [0, 1, 2].map((offset) => testimonials[(testimonialStart + offset) % testimonials.length]);

  return <main className="aster-finance" aria-label="Aster Finance marketing site">
    <header className="af-header">
      <div className="af-container af-header-inner">
        <a className="af-brand" href="#top" aria-label="Aster Finance home"><AsterMark /><span>aster<span>finance</span></span></a>
        <Button type="button" variant="ghost" size="icon" className="af-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="af-main-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}</Button>
        <nav id="af-main-navigation" className={`af-navigation${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
          <Button size="sm" onClick={() => openSignup()} className="af-nav-cta">Get started <ArrowRight size={15} aria-hidden="true" /></Button>
        </nav>
      </div>
    </header>

    <section className="af-hero af-container" id="top" aria-labelledby="af-hero-title">
      <div className="af-hero-copy">
        <Badge className="af-kicker"><span className="af-kicker-dot" /> A clearer kind of money routine</Badge>
        <h1 id="af-hero-title">Make room for <span>what matters.</span></h1>
        <p>See the month ahead, make a little progress, and feel more at home with your money.</p>
        <div className="af-hero-actions"><Button onClick={() => openSignup()} className="af-button--hero">Find your next step <ArrowRight size={16} aria-hidden="true" /></Button><a href="#features" className="af-text-link">Take a quick look <ArrowUpRight size={15} aria-hidden="true" /></a></div>
        <div className="af-hero-proof"><span className="af-proof-stars" aria-label="Five decorative stars"><Star /><Star /><Star /><Star /><Star /></span><span><strong>Made for everyday decisions</strong><small>Sample product concept · no account required</small></span></div>
      </div>
      <div className="af-hero-visual" role="img" aria-label="Illustrative Aster app screen showing a sample balance, spending categories, and savings goal">
        <div className="af-hero-glow" />
        <div className="af-orbit af-orbit--one" />
        <div className="af-orbit af-orbit--two" />
        <div className="af-hero-spark af-hero-spark--one"><Sparkles size={17} /></div>
        <div className="af-hero-spark af-hero-spark--two"><Check size={15} /></div>
        <div className="af-phone">
          <div className="af-phone-notch" />
          <div className="af-phone-status"><span>9:41</span><span aria-hidden="true">● ● ▰</span></div>
          <div className="af-phone-head"><AsterMark size={15} /><span>Good morning, Maya</span><span className="af-phone-avatar">M</span></div>
          <div className="af-phone-balance"><small>Available this month</small><strong>$4,820<span>.50</span></strong><span className="af-balance-note"><ArrowUpRight size={13} /> You're on track</span></div>
          <div className="af-phone-chart"><div className="af-chart-top"><span>Spending rhythm</span><small>THIS MONTH</small></div><div className="af-phone-bars" aria-hidden="true">{[33, 49, 39, 67, 48, 82, 59, 72, 53, 88, 63, 76].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="af-chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div>
          <div className="af-phone-goal"><span className="af-goal-icon"><PiggyBank size={16} /></span><span><small>Weekend away</small><b>$680 <small>of $1,000</small></b></span><span className="af-goal-progress"><i /></span></div>
          <div className="af-phone-nav"><span className="is-active"><Wallet size={15} />Home</span><span><BarChart3 size={15} />Plan</span><span><TrendingUp size={15} />Goals</span></div>
        </div>
        <Card className="af-float-card af-float-card--spend"><span className="af-float-icon"><CreditCard size={16} /></span><span><small>Daily spending</small><b>$42.80</b></span><span className="af-float-change">−12%</span></Card>
        <Card className="af-float-card af-float-card--goal"><span className="af-float-icon is-green"><CheckCircle2 size={17} /></span><span><small>Goal progress</small><b>68% there</b></span><span className="af-goal-ring">68%</span></Card>
      </div>
    </section>

    <section className="af-trust af-container" aria-label="Aster product principles">
      <div className="af-trust-panel"><div><p className="af-overline">LESS GUESSWORK, MORE GOOD DAYS</p><h2>Your money, with a little more breathing room.</h2></div><div className="af-trust-divider" /><div className="af-trust-copy"><span className="af-trust-check"><Check size={17} aria-hidden="true" /></span><p>One thoughtful place to see everyday spending, upcoming plans, and the goals you care about.</p></div><div className="af-trust-bottom"><span>AN ILLUSTRATIVE FINANCE CONCEPT</span><div className="af-trust-wordmarks" aria-label="Fictional sample ecosystem names"><b>northbank</b><b>daylight</b><b>clover</b><b>commonwell</b></div></div></div>
    </section>

    <section className="af-section af-container" id="features" aria-labelledby="af-features-title">
      <div className="af-section-heading"><Badge className="af-section-badge">The Aster approach</Badge><h2 id="af-features-title">A better view of your <span>everyday money.</span></h2><p>Bring the moving parts into focus, without making money feel like another full-time job.</p></div>
      <div className="af-feature-grid">
        <Card className="af-feature-card af-feature-card--wide"><CardHeader><span className="af-icon-tile"><Wallet size={19} aria-hidden="true" /></span><CardTitle>Know where this month is going</CardTitle><p>One calm snapshot for what came in, what went out, and what is next.</p></CardHeader><CardContent><div className="af-budget-preview"><div className="af-budget-total"><span><small>Month-to-date spending</small><b>$2,460</b></span><Badge className="af-soft-badge"><ArrowDownRight size={13} /> On plan</Badge></div><div className="af-budget-bars">{[{ name: "Home", value: "$980", width: 76 }, { name: "Food & coffee", value: "$540", width: 54 }, { name: "Getting around", value: "$310", width: 37 }].map((item) => <div className="af-budget-row" key={item.name}><span>{item.name}</span><b>{item.value}</b><i><span style={{ width: `${item.width}%` }} /></i></div>)}</div><span className="af-demo-caption">Illustrative sample figures</span></div></CardContent></Card>
        <Card className="af-feature-card af-feature-card--goals"><CardHeader><span className="af-icon-tile af-icon-tile--mint"><PiggyBank size={19} aria-hidden="true" /></span><CardTitle>Make a goal feel closer</CardTitle><p>Small steps can make a big plan easier to picture.</p></CardHeader><CardContent><div className="af-goal-preview"><span className="af-goal-orbit"><i /><PiggyBank size={25} aria-hidden="true" /></span><div><small>Cabin weekend</small><b>$680 <span>of $1,000</span></b></div><div className="af-progress-track"><i /></div><small className="af-goal-caption">68% of this sample goal</small></div></CardContent></Card>
        <Card className="af-feature-card af-feature-card--insights"><CardHeader><span className="af-icon-tile af-icon-tile--peach"><BarChart3 size={19} aria-hidden="true" /></span><CardTitle>Find your own rhythm</CardTitle><p>Simple patterns can help make next month feel more predictable.</p></CardHeader><CardContent><div className="af-insight-preview"><div className="af-insight-summary"><span><small>Flexible spending</small><b>$1,240</b></span><span className="af-trend"><TrendingUp size={13} /> 6.2%</span></div><div className="af-insight-chart" role="img" aria-label="Illustrative monthly spending chart"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="af-insight-axis"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div></CardContent></Card>
        <Card className="af-feature-card af-feature-card--privacy"><CardHeader><span className="af-icon-tile af-icon-tile--lavender"><ShieldCheck size={19} aria-hidden="true" /></span><CardTitle>Clarity, with care</CardTitle><p>Good product experiences say what they do—and what they do not.</p></CardHeader><CardContent><div className="af-privacy-preview"><span><CheckCircle2 size={17} /><b>Clear controls</b><small>Know what each setting means.</small></span><span><CheckCircle2 size={17} /><b>Plain language</b><small>Information without the jargon.</small></span><span className="af-privacy-note">Concept preview · no real data connected</span></div></CardContent></Card>
      </div>
    </section>

    <section className="af-benefits af-section" id="benefits" aria-labelledby="af-benefits-title">
      <div className="af-container">
        <div className="af-section-heading af-section-heading--left"><Badge className="af-section-badge">Small shifts, over time</Badge><h2 id="af-benefits-title">Make money feel a little <span>less complicated.</span></h2><p>Helpful tools should make space for life—not add more noise to it.</p></div>
        <div className="af-benefit-list">
          <article className="af-benefit-row"><div className="af-benefit-art af-benefit-art--calm" role="img" aria-label="Illustration of a calm monthly plan with a sample amount"><div className="af-art-label"><span className="af-art-small-mark"><Sparkles size={13} /></span><span><small>YOUR MONTH, AT A GLANCE</small><b>A plan with room to move</b></span></div><div className="af-art-number">$2,840 <span>available to plan</span></div><div className="af-art-pills"><span>Home <b>$980</b></span><span>Everyday <b>$760</b></span><span>Goals <b>$420</b></span></div><i className="af-art-sun" /></div><div className="af-benefit-copy"><span className="af-step-label">01 · MORE CLARITY</span><h3>See the month as it unfolds.</h3><p>Keep planned bills, everyday spending, and a little flexibility in view together.</p><ul><li><Check size={15} />A simple monthly overview</li><li><Check size={15} />Room for plans to change</li></ul></div></article>
          <article className="af-benefit-row af-benefit-row--reverse"><div className="af-benefit-art af-benefit-art--growth" role="img" aria-label="Illustration of a savings goal and progress chart"><div className="af-growth-orbit"><div><PiggyBank size={25} /><b>$1,200</b><small>sample goal</small></div></div><div className="af-growth-mini"><small>A LITTLE CLOSER</small><span><i /><i /><i /><i /><i /><i /><i /></span><b>Steady progress</b></div><span className="af-growth-spark"><Sparkles size={18} /></span></div><div className="af-benefit-copy"><span className="af-step-label">02 · STEADY PROGRESS</span><h3>Give good intentions a place to land.</h3><p>Turn a long-range idea into smaller milestones that still feel like yours.</p><ul><li><Check size={15} />Flexible savings targets</li><li><Check size={15} />Progress you can revisit</li></ul></div></article>
          <article className="af-benefit-row"><div className="af-benefit-art af-benefit-art--focus" role="img" aria-label="Illustration of a sample spending insight and category breakdown"><div className="af-focus-card"><div><span className="af-focus-icon"><TrendingUp size={16} /></span><span><small>A PATTERN TO NOTICE</small><b>Everyday spending</b></span><ArrowUpRight size={15} /></div><strong>More room on weekends</strong><p>Your sample weekday spend is trending lower this month.</p><div className="af-focus-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><small>AN ILLUSTRATIVE INSIGHT</small></div><i className="af-focus-star"><Sparkles size={16} /></i></div><div className="af-benefit-copy"><span className="af-step-label">03 · BETTER PERSPECTIVE</span><h3>Notice a pattern. Choose what comes next.</h3><p>Thoughtful summaries help you make the next decision with a little more context.</p><ul><li><Check size={15} />Readable category snapshots</li><li><Check size={15} />No complicated charts to decode</li></ul></div></article>
        </div>
      </div>
    </section>

    <section className="af-stats af-container" aria-label="Aster product principles">
      <div className="af-stat"><span className="af-stat-mark"><Wallet size={18} /></span><b>One view</b><p>Everyday spending and plans, together.</p></div>
      <div className="af-stat"><span className="af-stat-mark"><TrendingUp size={18} /></span><b>Your pace</b><p>Goals that flex as real life changes.</p></div>
      <div className="af-stat"><span className="af-stat-mark"><ShieldCheck size={18} /></span><b>Plain language</b><p>Helpful context, without the jargon.</p></div>
    </section>

    <section className="af-section af-container" id="how-it-works" aria-labelledby="af-how-title">
      <div className="af-how-panel"><div className="af-how-intro"><Badge className="af-section-badge">A simple place to begin</Badge><h2 id="af-how-title">A few small steps. <span>A clearer picture.</span></h2><p>No perfect spreadsheets or complicated setup. Start with the parts of your money life you want to understand better.</p><Button variant="outline" onClick={() => openSignup()}>Explore the preview <ArrowRight size={15} aria-hidden="true" /></Button><p className="af-demo-caption">This sample does not connect to real accounts.</p></div><ol className="af-steps">{[{ title: "Bring your month into view", note: "Start with the bills, plans, and spending you want to keep in sight.", icon: Wallet }, { title: "Choose a goal that matters", note: "Give a future plan its own name and a first small milestone.", icon: PiggyBank }, { title: "Check in when it helps", note: "Come back to the overview and make the next step your own.", icon: CheckCircle2 }].map(({ title, note, icon: Icon }, index) => <li key={title}><span className="af-step-number">0{index + 1}</span><span className="af-step-icon"><Icon size={18} aria-hidden="true" /></span><span><b>{title}</b><small>{note}</small></span><ArrowRight size={16} aria-hidden="true" /></li>)}</ol><div className="af-how-decor" aria-hidden="true"><span /><span /><span /></div></div>
    </section>

    <section className="af-section af-container" id="stories" aria-labelledby="af-stories-title">
      <div className="af-section-heading af-section-heading--split"><div><Badge className="af-section-badge">A little encouragement</Badge><h2 id="af-stories-title">Different lives. <span>More room to plan.</span></h2></div><div><p>Sample stories from the kind of people this concept is designed for.</p><div className="af-story-controls"><Button type="button" variant="outline" size="icon" aria-label="Previous stories" onClick={() => setTestimonialStart((index) => (index - 1 + testimonials.length) % testimonials.length)}><ChevronLeft size={17} aria-hidden="true" /></Button><span aria-live="polite">{testimonialStart + 1} / {testimonials.length}</span><Button type="button" variant="outline" size="icon" aria-label="Next stories" onClick={() => setTestimonialStart((index) => (index + 1) % testimonials.length)}><ChevronRight size={17} aria-hidden="true" /></Button></div></div></div>
      <div className="af-testimonial-grid" aria-live="polite">{visibleTestimonials.map((item) => <Card className="af-testimonial-card" key={item.name}><CardHeader><span className="af-quote-mark" aria-hidden="true">“</span><div className="af-stars" aria-label="Five out of five decorative stars"><Star /><Star /><Star /><Star /><Star /></div></CardHeader><CardContent><blockquote>{item.quote}</blockquote><div className="af-person"><span className="af-person-avatar">{item.initials}</span><span><b>{item.name}</b><small>{item.role} · fictional sample</small></span></div></CardContent></Card>)}</div>
    </section>

    <section className="af-section af-pricing af-container" id="pricing" aria-labelledby="af-pricing-title">
      <div className="af-section-heading"><Badge className="af-section-badge">Plans with breathing room</Badge><h2 id="af-pricing-title">Start simple. <span>Choose your pace.</span></h2><p>Sample plan options for this product concept. No payment details or subscription required.</p><div className="af-billing-toggle" role="group" aria-label="Billing frequency"><Button type="button" variant={annualBilling ? "ghost" : "secondary"} aria-pressed={!annualBilling} onClick={() => setAnnualBilling(false)}>Monthly</Button><Button type="button" variant={annualBilling ? "secondary" : "ghost"} aria-pressed={annualBilling} onClick={() => setAnnualBilling(true)}>Yearly <span className="af-save-label">Save up to 18%</span></Button></div></div>
      <div className="af-plan-grid">{plans.map((plan) => <Card className={`af-plan-card${plan.id === "everyday" ? " is-featured" : ""}`} key={plan.id}>{plan.id === "everyday" && <Badge className="af-popular-badge"><Sparkles size={12} /> A thoughtful favorite</Badge>}<CardHeader><span className="af-plan-name">{plan.name}</span><CardTitle>{plan.note}</CardTitle><p>Illustrative plan · local preview only</p></CardHeader><CardContent><div className="af-price"><strong>${annualBilling ? plan.yearly : plan.monthly}</strong><span>/{plan.id === "starter" ? "always" : "month"}</span></div><p className="af-billed-note">{plan.id === "starter" ? "No card required" : annualBilling ? "Billed yearly in this sample" : "Billed monthly in this sample"}</p><Button variant={plan.id === "everyday" ? "primary" : "outline"} className="af-plan-button" onClick={() => openSignup(plan.id)}>Choose {plan.name} <ArrowRight size={15} aria-hidden="true" /></Button><div className="af-plan-divider" /><p className="af-plan-includes">A few things included</p><ul>{plan.features.map((feature) => <li key={feature}><Check size={14} aria-hidden="true" />{feature}</li>)}</ul></CardContent></Card>)}</div>
    </section>

    <section className="af-section af-container" id="articles" aria-labelledby="af-articles-title">
      <div className="af-section-heading af-section-heading--split af-articles-heading"><div><Badge className="af-section-badge">The Aster journal</Badge><h2 id="af-articles-title">A few ideas for <span>the road ahead.</span></h2></div><p>Practical prompts for making money feel a little more understandable.</p></div>
      <div className="af-article-grid">{articles.map((article, index) => <Card className={`af-article-card af-article-card--${index + 1}`} key={article.title}><div className={`af-article-art af-article-art--${index + 1}`} aria-hidden="true">{index === 0 ? <div className="af-article-calendar"><span>THIS MONTH</span><b>Make a little room</b><i /><i /><i /></div> : index === 1 ? <div className="af-article-savings"><span><PiggyBank size={24} /></span><i /><i /><i /></div> : <div className="af-article-buffer"><span>PLAN AHEAD</span><b>$<i>___</i></b><div><i /><i /><i /></div></div>}</div><CardHeader><div className="af-article-meta"><span>{article.category}</span><span>{article.date}</span></div><CardTitle>{article.title}</CardTitle></CardHeader><CardContent><p>{article.summary}</p><Button type="button" variant="ghost" size="sm" className="af-article-link" onClick={() => setSelectedArticle(article)}>Read the note <ArrowRight size={15} aria-hidden="true" /></Button></CardContent></Card>)}</div>
    </section>

    <section className="af-section af-container" id="faq" aria-labelledby="af-faq-title">
      <div className="af-faq-layout"><div className="af-faq-intro"><Badge className="af-section-badge">A few useful details</Badge><h2 id="af-faq-title">Questions, <span>answered simply.</span></h2><p>Want to know what is real in this preview? Start here.</p><a href="#top" className="af-text-link">Back to the top <ArrowUpRight size={15} aria-hidden="true" /></a></div><div className="af-faq-list">{faqs.map((faq, index) => <details className="af-faq-item" key={faq.question} open={index === 0}><summary><span>{faq.question}</span><ChevronDown size={17} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></div>
    </section>

    <section className="af-final-cta af-container" aria-labelledby="af-cta-title"><div className="af-cta-panel"><div className="af-cta-orb af-cta-orb--one" /><div className="af-cta-orb af-cta-orb--two" /><span className="af-cta-icon"><Sparkles size={20} aria-hidden="true" /></span><p className="af-overline">YOUR NEXT STEP CAN BE A SMALL ONE</p><h2 id="af-cta-title">Make a little more room for <span>your future.</span></h2><p>Explore the Aster concept and find a helpful place to begin.</p><div className="af-cta-actions"><Button onClick={() => openSignup()} className="af-button--light">Get started free <ArrowRight size={15} aria-hidden="true" /></Button><Button variant="ghost" onClick={() => openStoreNotice("Mobile app") } className="af-button--cta-ghost"><Smartphone size={16} aria-hidden="true" /> App concept</Button></div><small>Design preview only · no account, payments, or app download</small></div></section>

    <footer className="af-footer"><div className="af-container"><div className="af-footer-main"><div className="af-footer-brand"><a className="af-brand" href="#top"><AsterMark /><span>aster<span>finance</span></span></a><p>A calmer-looking place for everyday money plans.</p><div className="af-footer-apps"><Button variant="outline" size="sm" onClick={() => openStoreNotice("iOS app") }><Smartphone size={14} aria-hidden="true" /> iOS concept</Button><Button variant="outline" size="sm" onClick={() => openStoreNotice("Android app") }><Smartphone size={14} aria-hidden="true" /> Android concept</Button></div></div><div className="af-footer-links"><div><b>Explore</b><a href="#features">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Plans</a></div><div><b>Discover</b><a href="#stories">Stories</a><a href="#articles">Journal</a><a href="#faq">Questions</a></div><div><b>Preview</b><button type="button" onClick={() => openSignup()}>Get started</button><button type="button" onClick={() => notify("Privacy concept", "This fictional landing page has no data collection or privacy policy service.")}>Privacy note</button><button type="button" onClick={() => notify("Sample only", "Aster Finance is a fictional design concept, not a financial service.")}>About this sample</button></div></div></div><div className="af-footer-bottom"><span>© 2026 Aster Finance · Fictional design concept</span><span>All figures, plans, stories, and partner names are illustrative sample content.</span></div></div></footer>

    <Dialog open={signupOpen} onOpenChange={setSignupOpen}><DialogContent className="af-dialog" aria-describedby="af-signup-description"><DialogHeader><DialogTitle>Take your first step with Aster</DialogTitle><DialogDescription id="af-signup-description">You're exploring the {plans.find((plan) => plan.id === selectedPlan)?.name} sample plan. This form is local only; no account will be created.</DialogDescription></DialogHeader><form className="af-signup-form" onSubmit={submitSignup}><Label htmlFor="af-name">Your name</Label><Input id="af-name" name="name" autoComplete="name" required placeholder="e.g. Alex Morgan" /><Label htmlFor="af-email">Email address</Label><Input id="af-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /><p className="af-form-note"><ShieldCheck size={15} aria-hidden="true" />Local preview only. Nothing is sent or stored.</p><DialogFooter><Button type="button" variant="outline" onClick={() => setSignupOpen(false)}>Not now</Button><Button type="submit">Continue with {plans.find((plan) => plan.id === selectedPlan)?.name} <ArrowRight size={15} aria-hidden="true" /></Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={selectedArticle !== null} onOpenChange={(open) => !open && setSelectedArticle(null)}>{selectedArticle && <DialogContent className="af-dialog" aria-describedby="af-article-description"><DialogHeader><Badge className="af-section-badge">{selectedArticle.category} · {selectedArticle.date}</Badge><DialogTitle>{selectedArticle.title}</DialogTitle><DialogDescription id="af-article-description">{selectedArticle.summary}</DialogDescription></DialogHeader><p className="af-article-dialog-copy">A useful money routine does not need to start with a perfect plan. Start by noticing one thing you want to make easier this month. Give it a small next step, leave room for life to change, then check in when it feels useful. This fictional journal preview shares general planning prompts only—not financial advice.</p><DialogFooter><Button variant="outline" onClick={() => setSelectedArticle(null)}>Close note</Button><Button onClick={() => { setSelectedArticle(null); openSignup(); }}>Explore Aster <ArrowRight size={15} aria-hidden="true" /></Button></DialogFooter></DialogContent>}</Dialog>
    <Toast title={toast.title} description={toast.description} open={toastOpen} onOpenChange={setToastOpen} />
  </main>;
}

export default AsterFinance;
