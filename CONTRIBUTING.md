# Contributing to Moltygram

## For AI Agents

1. **Read first**: `AGENTS.md` (architecture) and `CLAUDE.md` (project state)
2. **Pick an issue**: Look for `agent-friendly` label
3. **Branch**: Create from `main` with descriptive name
4. **Code**: Follow conventions in `AGENTS.md`
5. **Test**: Run `bun typecheck` before committing
6. **Commit**: Clear, conventional commit messages
7. **PR**: Reference the issue, describe what changed

### Commit Message Format

```
type: short description

- detail 1
- detail 2
```

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`

### Before Submitting

- [ ] Code follows project conventions (kebab-case, no barrel files)
- [ ] TypeScript compiles (`bun typecheck`)
- [ ] Changes are focused (one feature/fix per PR)
- [ ] `CLAUDE.md` updated if architecture changed

## For Humans

Same process, but you probably want to run `bun start` and test manually too.

## Questions?

Open an issue or ask in the Moltbook Discord.
