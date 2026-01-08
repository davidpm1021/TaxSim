# Vibe Coding Methodology for Angular/TypeScript Projects

> This document defines the AI-assisted development workflow for all projects. It is referenced by project-specific `CLAUDE.md` files.

## Core Philosophy

Vibe coding is **structured delegation to AI agents**, not "forgetting the code exists." Success requires:

1. Investing heavily in specifications before generation
2. Maintaining rigorous quality gates
3. Following the Explore → Plan → Code → Commit workflow

---

## The Explore → Plan → Code → Commit Workflow

### 1. EXPLORE (Before Any Code)

**Purpose**: Understand the codebase and existing patterns before making changes.

```
Agent Instructions:
- Read the CLAUDE.md file first
- Examine relevant existing files without modifying them
- Identify patterns, conventions, and dependencies
- Note any potential conflicts or considerations
- DO NOT write any code yet
```

**Trigger phrases**:

- "Explore the codebase for..."
- "What files would be affected by..."
- "Show me how [existing feature] is implemented"

### 2. PLAN (Get Approval First)

**Purpose**: Create an implementation plan before writing code.

```
Agent Instructions:
- Propose a specific implementation approach
- List files to create/modify
- Describe the data flow
- Identify tests needed
- Estimate complexity
- WAIT for human approval before proceeding
```

**Trigger phrases**:

- "Create a plan for..."
- "ultrathink" (enables extended thinking)
- "What's your implementation approach for..."

**Plan Template**:

```markdown
## Implementation Plan: [Feature Name]

### Files to Create

- path/to/new-file.ts - Purpose

### Files to Modify

- path/to/existing.ts - What changes

### Data Flow

1. User does X
2. Component calls Y
3. Service returns Z

### Tests Required

- [ ] Test case 1
- [ ] Test case 2

### Risks/Considerations

- Note any concerns

Awaiting approval to proceed.
```

### 3. CODE (Test-First)

**Purpose**: Implement with tests written before production code.

```
Agent Instructions:
- Write failing tests FIRST based on requirements
- Run tests to confirm they fail
- Implement minimum code to pass tests
- Refactor while keeping tests green
- Make small, focused commits
```

**Test-First Sequence**:

1. "Write tests for [feature] based on requirements. Do NOT write implementation yet."
2. Run tests → confirm failures
3. "Now implement to make tests pass. Do NOT modify tests."
4. Iterate until green

### 4. COMMIT (Atomic & Descriptive)

**Purpose**: Create clean, reversible git history.

```
Agent Instructions:
- Each commit = one logical change
- Use conventional commit format
- Commit tests separately from implementation when useful
- Never commit failing tests to main
```

**Commit Format**:

```
type(scope): description

feat(income): add W-2 entry form
fix(calc): correct tax bracket boundaries
test(credits): add EITC eligibility tests
refactor(core): extract validation logic
docs(readme): add setup instructions
```

---

## Quality Gates (Non-Negotiable)

### Before Every Commit

- [ ] All tests pass (`ng test`)
- [ ] Linting passes (`ng lint`)
- [ ] TypeScript compiles with no errors
- [ ] Manual smoke test of affected feature

### Before Every PR/Merge

- [ ] Code reviewed (by different model or human)
- [ ] No new lint warnings
- [ ] Test coverage maintained or improved
- [ ] Documentation updated if needed

### Human-in-the-Loop Required For

- Authentication/authorization code
- Data deletion operations
- Configuration changes
- Deployment to any environment
- Merges to main branch

---

## Prompting Best Practices

### Good Prompts (Specific & Bounded)

```
✅ "Write a test case for TaxCalculationService.calculateTax()
    covering the edge case where income is exactly at a bracket
    boundary. Follow the pattern in tax-calculation.service.spec.ts"

✅ "Look at the existing W2EntryComponent. Following the same
    patterns, create a Form1099EntryComponent with fields for
    payer name and Box 1 (nonemployee compensation)."

✅ "Refactor the deduction comparison logic into a pure function
    that takes itemized totals and filing status, returns which
    option saves more. Add unit tests."
```

### Poor Prompts (Vague & Unbounded)

```
❌ "Add tax calculation"
❌ "Make the form work"
❌ "Fix the bugs"
❌ "Add tests"
```

### Prompt Improvement Pattern

| Before           | After                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| "add tests"      | "Write tests for X covering edge cases Y and Z. Follow pattern in existing.spec.ts"     |
| "fix the error"  | "The error in [file] at line [N] shows [message]. Investigate and propose a fix."       |
| "make it faster" | "Profile [function] and identify the bottleneck. Propose optimization with benchmarks." |

---

## Cross-Model Verification

When quality is critical, use different models for generation and review:

### Generator-Reviewer Pattern

1. **Model A** (Claude): Generate implementation
2. **Clear context** or fresh session
3. **Model B** (ChatGPT/Gemini): Review for:
   - Type safety issues
   - Framework best practices
   - Performance concerns
   - Security vulnerabilities
4. **Model A or C**: Incorporate feedback into final version

### When to Use Multi-Model Review

- Complex business logic
- Security-sensitive code
- Performance-critical paths
- Unfamiliar APIs or patterns

---

## Parallel Agent Coordination

### When to Parallelize

- Features with clear boundaries (no shared files)
- Independent bug fixes
- Documentation generation
- Research/proof-of-concept work

### When NOT to Parallelize

- Shared service modifications
- Core model changes
- Database schema updates
- Anything touching the same files

### Parallel Setup (Git Worktrees)

```bash
# Create isolated worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b

# Launch agents in separate terminals
cd ../project-feature-a && claude
cd ../project-feature-b && claude
```

### Coordination Rules

- Maximum 3-5 parallel agents
- Define explicit input/output contracts
- Use shared markdown for status updates
- Merge sequentially, not simultaneously

---

## Edge Case Handling

### Always Request Edge Cases Explicitly

```
"Include edge cases:
- Empty/null inputs
- Boundary values (0, max, exactly at limits)
- Invalid data types
- Unicode/special characters
- Concurrent operations (if applicable)"
```

### Common AI Blind Spots

- **Happy path bias**: AI often generates tests that only cover success scenarios
- **Boundary errors**: Off-by-one errors at bracket boundaries, limits
- **Null handling**: Missing null checks for optional data
- **Type coercion**: JavaScript's loose equality causing bugs
- **Async race conditions**: Promise handling edge cases

---

## Error Recovery

### When AI Output Is Wrong

1. **Don't iterate blindly** - If 2-3 attempts fail, pause and reassess
2. **Add context** - The AI is probably missing information
3. **Reduce scope** - Break the task into smaller pieces
4. **Try different model** - Each has different strengths
5. **Scout first** - Have an agent explore without landing code

### When Tests Keep Failing

```
"The test [name] is failing with [error].
Before fixing, explain:
1. What the test is checking
2. Why the current implementation doesn't satisfy it
3. The minimal change needed to fix it"
```

### When Stuck

```
"I'm stuck on [problem].
Current state: [description]
What I've tried: [list]
What I expected: [description]

Help me debug by:
1. Identifying what information is missing
2. Suggesting diagnostic steps
3. Proposing a different approach if needed"
```

---

## Angular-Specific Patterns

### Signal-Based State

```typescript
// ✅ Prefer signals over BehaviorSubject for component state
data = signal<T>(initialValue);
derived = computed(() => transform(this.data()));

// Use effect() sparingly - only for side effects
effect(() => {
  console.log("Data changed:", this.data());
});
```

### Dependency Injection

```typescript
// ✅ Use inject() function
private readonly service = inject(MyService);

// ❌ Avoid constructor injection
constructor(private service: MyService) {}
```

### Template Patterns

```typescript
// ✅ Native control flow
@if (loading()) {
  <spinner />
} @else if (error()) {
  <error-message [error]="error()" />
} @else {
  <content [data]="data()" />
}

// ✅ Track by for performance
@for (item of items(); track item.id) {
  <item-card [item]="item" />
}
```

---

## Documentation Updates

### When to Update Docs

- New patterns introduced
- API contracts changed
- Configuration modified
- Lessons learned from debugging

### What to Document

- **Why** decisions were made (not just what)
- Gotchas discovered during implementation
- Performance considerations
- Security implications

---

## Session Hygiene

### Starting a Session

1. Read CLAUDE.md for project context
2. Check recent git log for context
3. Review any open issues/tasks
4. State the goal for this session

### Ending a Session

1. Commit or stash all work
2. Update task tracking
3. Note any blockers or decisions needed
4. Leave context for next session

### Context Window Management

- For large tasks, provide focused context (not entire codebase)
- Reference specific files rather than pasting entire contents
- Use MCP tools (Context7, filesystem) for documentation access
- Clear context between unrelated tasks
