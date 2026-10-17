<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- My Development Plan state lives in an in-memory store (`src/lib/dev/store.tsx`) whose types mirror the planned relational tables — swap for Lovable Cloud without changing UI. Why: prototype first, schema-ready.
- History (check-ins, assessments, goal history) is append-only; competency level changes only via explicit manager confirmation, never derived from action progress. Why: core product rule.
