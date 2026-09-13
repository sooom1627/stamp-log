# Backlog

Single source of truth for Epic / Story / Task. Lightweight agile only — no sprints, velocity, or points.

## How to use

1. Add or refine a **Story** before implementation. Link it under an **Epic**.
2. Split work into vertical **Tasks** (user-visible behavior, not layers).
3. Deliver **one Story** at a time. Mark task checkboxes as you commit.
4. Story IDs: `E-###`, `S-###`, `T-###`. Reference the Story ID in commit messages.

Template (copy under an epic; delete sample content when real work starts):

```markdown
## Epic: E-001 Title

ゴール:

### Story: S-001 Title

As a ... I want ... so that ...

受け入れ:

- Given ... When ... Then ...

Tasks:

- [ ] T-001: （振る舞いの一文）
```

---

<!-- Product epics and stories go below. Keep this file the only backlog. -->
