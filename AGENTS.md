# Autonomous Development Permissions & Operational Rules

## Scope: Project Workspace Only (`/home/saran/projects/the one`)

### 1. Pre-Authorized Autonomous Operations (ALLOW)
The agent is authorized to autonomously execute:
- **Filesystem**: Read, create, edit, overwrite, organize, and format project files within the workspace.
- **Dependencies**: Install and update dependencies using `npm`, `npx`, `pnpm`, `yarn`, `pip`, and `python`.
- **Development Lifecycle**: Run development servers, builds, linters, formatters, and test suites (`jest`, `vitest`, `pytest`).
- **Git Operations**: `git status`, `git diff`, `git add`, `git commit`, `git checkout`, `git switch`, `git branch`, `git merge`, `git log`, `git show`, and `git stash`.
- **Containers**: Execute Docker and docker-compose commands for project-local containers.
- **Local Tooling**: Run database migrations (`prisma`, `alembic`, `sqlite`) and project-local development scripts.
- **Self-Healing**: Diagnose, debug, and fix compile/test/runtime errors autonomously.

### 2. Guardrails Requiring Explicit User Confirmation (ASK)
The agent MUST pause and ask for user approval before:
- Executing git commits (`git commit`) — NO commits until explicitly instructed by the user.
- Invoking `sudo`, `su`, or any elevated administrative command.
- Modifying system-wide configuration files (e.g., `/etc/*`, `systemctl`).
- Network configuration changes (`ufw`, `iptables`, DNS, proxy).
- Accessing or modifying files outside this workspace (e.g., `~/.ssh/`, `~/.aws/`, `~/.gnupg/`, browser profiles).
- Executing deployment commands (`*deploy*`, `*publish*`) or incurring paid cloud charges.
- Performing recursive ownership/permission changes (`chmod -R 777`, `chown`).

### 3. Strictly Prohibited Operations (DENY)
Under NO circumstances may the agent:
- Execute destructive disk or partition commands (`dd if=*`, `mkfs*`, `fdisk*`, `parted*`).
- Run blind or root recursive deletions (`rm -rf /`, `rm -rf /*`, `rm -rf ~*`).
- Delete or corrupt the `.git` repository directory or project VCS history (`rm -rf .git*`, `git push --force`, `git branch -D main/master`).
- Read or transmit plain secrets (`.env`, `id_rsa`, `id_ed25519`, `credentials*`).
