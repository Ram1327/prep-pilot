# WORKFLOW.md

## Universal AI Development Loop

START

↓

Read:

* INSTRUCTIONS.md
* PROJECT.md
* CURRENT_STATE.md
* TASKS.md
* SUCCESS_CRITERIA.md
* DECISIONS.md

↓

Analyze project state

↓

Select highest priority task

↓

Create implementation plan

↓

Implement task

↓

Run project

↓

Check:

* Build errors
* Runtime errors
* Browser console errors
* Type errors
* Lint errors

↓

Open localhost

↓

Verify:

* UI correctness
* Responsiveness
* Feature functionality

↓

Fix discovered issues

↓

Retest

↓

Update:

* CURRENT_STATE.md
* TASKS.md
* DECISIONS.md

↓

Check SUCCESS_CRITERIA.md

↓

If completed:

STOP

↓

Else:

Loop Count +1

↓

If Loop Count > 5

STOP

Update CURRENT_STATE.md

Document blockers

↓

END

wait for user

---

Session Summary Format

Completed:

* item

In Progress:

* item

Blocked:

* item

Next Recommended Action:

* item

---

Context Recovery Procedure

When resuming after interruption:

1. Read all project files
2. Read latest commits
3. Read CURRENT_STATE.md
4. Verify actual codebase matches documentation
5. Continue from Next Recommended Action

Never restart analysis from scratch if documentation exists.
