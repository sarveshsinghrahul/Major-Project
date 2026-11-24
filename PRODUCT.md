# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Second- and third-year B.Tech (IT/CS) students studying Data Structures and Algorithms on their own, for exams and placement preparation. They study in short sessions, often on a phone as well as a laptop, and start with very different prior knowledge.

## Product Purpose

LearnPath works out where a student should start in DSA and what they should study next. A diagnostic quiz places the student at a level, sets an initial mastery for each topic, and opens topics only when their prerequisites are strong enough. Success is a student who always knows their next topic and why, and who spends no time on topics they already know.

## Positioning

Every decision the system makes carries its reason: the level comes with the score breakdown that produced it, and every locked topic names the prerequisite and the score it is waiting for. The reason is produced by the same rule as the decision, so it never disagrees with the behaviour.

## Operating Context

- Onboarding: goals, weekly hours, preferred days and formats, and a self-rating, then a 32-question diagnostic (two questions per topic), one question at a time, resumable, with an "I don't know this yet" option.
- Results: level, per-topic mastery and status (mastered, ready, locked) with reasons, and an answer review with explanations.
- Roadmap dashboard: the 16 topics in prerequisite order with status, estimated time and mastery.
- A public landing page at /welcome/ explains the product to new students.
- The project is the authors' B.Tech final-year project at AKGEC Ghaziabad (Navya Mittal, Sakshi Shukla, Sarvesh Singh; guide Ms. Ayushi), with a research paper written about the learner model.

## Capabilities and Constraints

- Subject: Data Structures and Algorithms only, 16 topics, 48 questions; resources are short notes and reference links per topic.
- Thresholds: a topic opens when every prerequisite reaches 60% and counts as mastered at 80%; levels are beginner (under 40%), intermediate, advanced (over 75%).
- Not built yet: topic study pages, practice quizzes that update mastery, recommendations, weekly schedule, gamification, instructor view. Design must not imply these exist.
- Stack: React 18, Vite, TypeScript, Tailwind 3 (frontend/); FastAPI (backend/); the landing page is static HTML in frontend/public/welcome/.

## Brand Commitments

Name: LearnPath. Logo mark: a ring. Free to use; no pricing.

## Evidence on Hand

Real product content only: the topic list, prerequisite graph, questions and thresholds in backend/app/seed/dsa.yaml. There are no users, testimonials, ratings, statistics or press: never invent them.

## Product Principles

1. Show the reason with the decision, in plain language and with the numbers.
2. Always make the next step obvious: the next topic to study and why.
3. Be honest about what is and isn't built; never fake progress, proof or features.
4. Respect a student's time: short steps, resumable work, no busywork.

## Accessibility & Inclusion

WCAG 2.2 AA: keyboard operable, visible focus, AA contrast. Must work well on phones (small screens, touch targets, no zoom-inducing inputs).
