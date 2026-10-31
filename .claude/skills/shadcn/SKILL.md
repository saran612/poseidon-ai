---
name: shadcn
description: Guidance for creating, installing, and customizing shadcn/ui components in your project using the shadcn CLI.
metadata:
  author: shadcn
  version: "4.0.0"
---

# shadcn/ui Agent Skill

Project-aware skill for managing, styling, and composing UI components with shadcn/ui.

## Workflow

1. Inspect project context using `npx shadcn@latest info --json` or read `components.json`.
2. Discover available components or search registry: `npx shadcn@latest search <query>`.
3. Read component documentation or specs: `npx shadcn@latest docs <component>`.
4. Install components via CLI:
   ```bash
   npx shadcn@latest add <component> --yes
   ```
5. Compose components using semantic design tokens (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.) instead of hardcoded hex/color scales.
6. Ensure accessibility attributes (aria-labels, focus rings, keyboard navigability) are preserved.
