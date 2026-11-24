---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages/Home.tsx","src/pages/Onboarding.tsx","src/pages/Login.tsx","src/pages/Register.tsx"]
---

# LearnPath app (login, onboarding, diagnostic, results, roadmap)

Mode: Operate. Audience: B.Tech students studying DSA alone, on phone and laptop. Job: know your level, see which topic is next and why, take the diagnostic. Constraints: WCAG AA, phone-first parity, never imply unbuilt features (practice, schedule, rewards).

## Direction contract

THESIS: The roadmap is a departures board: 16 topic rows that never move, only their status and mastery flaps change. Refuses the category default of a white dashboard of cards and progress bars.

OWN-WORLD: Matte flap-black boards (#0b0b0d) set into a brushed-steel frame (#2a2d31 shell, #5b5e63 rules); letter-white type (#f2f2f2); amber lamp (#ffb000) for the one thing to act on (Ready, primary button, active nav); steel-light (#a7aaaf) for locked; signal green only for mastered; cancel red only for errors and wrong answers. Archivo, condensed caps in fixed cells for board data and labels, normal width sentence case for reasons and prose.

STORY: The student sees their level and the board, reads that Arrays is boarding because Big-O reached 60%, and knows what to study next. In the diagnostic they answer one question at a time on a single board panel.

FIRST VIEWPORT: Steel rail left (bottom bar on phone) with LEARNPATH and nav; on the roadmap, a header strip with level and mastered count as flap cells, then the departures board full width: columns NO, TOPIC, STATUS, MASTERY, MIN; the Ready row lit amber; each row's reason in plain sentence case under the topic. Primary action: the Ready topic row and the "View diagnostic results" button.

FORM: rail concourse split-flap board (challenger, chosen by the user). seed:d2d2a7eb8489d9f3. Signature move: changed status and mastery cells cascade character by character once on load (instant under reduced motion), the table stays semantic.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
