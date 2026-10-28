import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizPlayer } from "./QuizPlayer";

const QUESTIONS = [
  { id: 10, topic_id: 1, text: "First question?", options: ["A1", "B1", "C1", "D1"] },
  { id: 11, topic_id: 1, text: "Second question?", options: ["A2", "B2", "C2", "D2"] },
  { id: 12, topic_id: 2, text: "Third question?", options: ["A3", "B3", "C3", "D3"] },
];

describe("QuizPlayer", () => {
  it("collects choices, skips and timing, then submits every question", () => {
    const onSubmit = vi.fn();
    render(<QuizPlayer quizId={1} questions={QUESTIONS} submitting={false} onSubmit={onSubmit} />);

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: /B1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("radio", { name: "I don't know this yet" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("radio", { name: /D3/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const answers = onSubmit.mock.calls[0][0];
    expect(answers.map((a: { question_id: number; chosen: number | null }) => [a.question_id, a.chosen])).toEqual([
      [10, 1],
      [11, null],
      [12, 3],
    ]);
    for (const a of answers) expect(a.time_taken_sec).toBeGreaterThanOrEqual(0);
  });

  it("resumes from a saved draft at the first unanswered question", () => {
    localStorage.setItem("learnpath.quiz.2", JSON.stringify({ 10: { chosen: 0, time: 4 } }));
    render(<QuizPlayer quizId={2} questions={QUESTIONS} submitting={false} onSubmit={vi.fn()} />);
    expect(screen.getByText("Second question?")).toBeInTheDocument();
    expect(screen.getByText("1 answered")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("radio", { name: /A1/ })).toHaveAttribute("aria-checked", "true");
  });
});
