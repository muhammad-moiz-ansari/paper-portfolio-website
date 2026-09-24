@AGENTS.md

## Editable Content Comments

Whenever you add or modify any user-facing content — headings, body text,
button labels, placeholder text, data arrays (experience, projects, skills,
education, notepad pages, contact info), color tokens tied to visual theming,
or hardcoded image/asset paths — mark it with a comment directly above it in
this exact format:

```
// EDIT: [SHORT LABEL] — [one-line description]
```

This keeps content easy to find and edit later without reading component
logic. Use the same LABEL naming style as existing comments in the codebase
(short, uppercase, descriptive) rather than inventing a new format.

Examples:
- `// EDIT: HERO HEADING — the big name/title text on the hero section`
- `// EDIT: HERO TAGLINE — the "I am ..." animated role phrases list`
- `// EDIT: ABOUT PARAGRAPH — the descriptive paragraph text in the About section`
- `// EDIT: NAV LABELS — the text shown for each nav tab`
- `// EDIT: EXPERIENCE DATA — array of work experience entries (role, company, dates, bullets)`
- `// EDIT: PROJECT DATA — array of project entries (title, description, links, images)`
- `// EDIT: CONTACT INFO — email, LinkedIn, GitHub handles and links`

Whenever you add a new EDIT comment, also add a corresponding entry to
`EDITING-GUIDE.txt` at the project root, following the existing format in that
file (grouped by section, with file path + line + description). Keep
EDITING-GUIDE.txt in sync with the actual EDIT comments in the code — if a
comment is removed or a piece of content is deleted, remove its entry from
the guide too.