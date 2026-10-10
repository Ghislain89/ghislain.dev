# Example: An Agent and a Skill (it's just text)

These files are a complete, minimal starting point that goes with the talk
**"Agents, Skills & MCP Servers — A Practical 101."**

The point of this package is one idea: **agents and skills aren't magic.**
They're plain markdown. Open either file and all you find is a little YAML
frontmatter (*what it is*) and prose (*how we work*). If you can write a
README, you can write one of these.

## What's here

| File | Job | The tell |
|---|---|---|
| `dev-agent.agent.md` | **Decides & acts** — a generic worker that implements any ticket | Has `tools:` — it can read, edit, run things |
| `post-endpoint-conventions/SKILL.md` | **Teaches** — reusable know-how for POST endpoints | No `tools:` — it executes nothing |
| `post-endpoint-conventions/*-example.md` | Reference snippets the skill points at | Code inside markdown — still just text |

The agent is **generic on purpose** — nothing in it is bolted to one ticket.
Hand it a ticket about a POST endpoint (say ISSUE-1234, *"add a POST endpoint to
create orders"*) and it loads `post-endpoint-conventions`, so the code it writes
matches how the team actually builds endpoints. The agent decides and acts; the
skill makes it specific. That pairing — generic worker plus targeted know-how —
is the whole mental model from the talk.

## Try it

1. Drop `dev-agent.agent.md` into your agents directory
   (e.g. `~/.agents/agents/` or your toolkit's `agents/` folder).
2. Drop the `post-endpoint-conventions/` folder into your skills directory
   (e.g. `~/.agents/skills/`).
3. Ask your assistant to implement a ticket, and watch it pull in the skill.

> These are deliberately tiny. Real agents and skills are longer, but they are
> the *same shape* — frontmatter plus instructions. Nothing more.

## The one rule to remember

> If it **decides**, make it an agent.
> If it **teaches**, make it a skill.
> If it **acts**, give it the simplest safe capability.

Start with your workflow, not the model. Keep each file small and focused.
Version them, review them, and test them — they're software too.
