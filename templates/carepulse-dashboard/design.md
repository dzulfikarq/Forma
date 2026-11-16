# CarePulse Dashboard

## Reference analysis

- Source: one user-supplied dashboard screenshot. Source product/author and image license were not identified. Screenshot is analysis-only; it is not bundled or redistributed.
- Observed structure: pale blue-green application shell; persistent left navigation grouped into Main menu, Manage, Resources, and Settings; compact top bar with breadcrumb, patient search, notifications, and profile; large white rounded content surface.
- Observed Patients page: page title and explanatory line; date-range, Export, and Enroll patient actions; a split analytics row with 72.0% on-track rate and target progress on the left, three enrollment/disenrollment KPIs with sparklines on the right; enrollment trend heatmap beside referral-source bars; lower cards for top clinics, monitoring-device mix, and adherence tiers.
- Visual system: cool mist/mint surfaces, white cards, thin blue-gray separators, dark evergreen text and primary actions, muted slate secondary text, amber near-target/warning state, and restrained coral risk state. Sans-serif UI typography with clear hierarchy: 24px page title, 18px card headers, 14px body, compact 12–13px labels. Rounded controls/cards and generous panel padding. Reference includes a circular staff photo and a four-petal brand mark; neither is reused.
- Visible controls/evidence: sidebar links; global patient search and keyboard hint; notification and profile controls; date-range selector; export; enrollment; Review; Daily chart selector; referral source rows; lower-panel overflow menus. Screenshot shows no animation or transient state, so no motion behavior is inferred.
- Other navigation pages are not shown. Their content is an original, fictional operations demo consistent with the reference domain; it is not claimed as source-product behavior.
- Responsive behavior is not evidenced by the screenshot. Implementation assumption: desktop sidebar becomes a shared accessible navigation dialog on narrow screens; metric and report grids stack; charts scroll within their panel; tables reflow into cards without page-level horizontal overflow.
- License/attribution: original implementation, original icon/layout composition, and fictional patient/clinic data. No source logo, photo, screenshot, or third-party code/assets copied. Plus Jakarta Sans uses the workspace's existing SIL Open Font License attribution.

## Implementation notes

- Registry category: `admin-cms` (existing category for operations dashboards); no new category added.
- Pages: Overview, Patients, Readings, Alerts, Care plans, Billing, Patient roster, Devices, Care teams, Integrations, Reports, Protocols, Learn, Help center, and Settings.
- Patient dashboard interactions: date range and chart interval selection, selectable heatmap days and referral sources, patient search, navigation, alert review, CSV exports, and accessible enrollment dialog. Other pages provide local filters, detail dialogs, row actions, toggles, and add-item flows where relevant.
- All displayed records are fictional. Mutations, integration toggles, generated reports, and exports are local preview behavior; no real patient data, EHR, device, payer, or account is connected.
- Pine is the default theme accent; Lagoon is the alternate. Shared tokens, controls, accessible dialogs, and reduced-motion behavior are used. Template compatibility remains `untested` until adapter integration tests exist.
- Deviations: reference's “Oriel” identity and all source-specific branding/photo are replaced. Secondary pages are original domain-consistent sample views because reference showed only Patients. Mobile/tablet behavior is designed and browser-tested because reference provides desktop only.
