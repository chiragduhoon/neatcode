export interface ProblemInfo {
  title: string;
  difficulty: string;
}

export function scrapeProblem(): ProblemInfo {
  // Try multiple selectors as LeetCode updates their DOM
  const titleEl =
    document.querySelector('[data-cy="question-title"]') ??
    document.querySelector(".text-title-large a") ??
    document.querySelector("title");

  const diffEl =
    document.querySelector('[diff]') ??
    document.querySelector(".text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard");

  const title = titleEl?.textContent?.trim() ?? "Unknown Problem";
  const difficulty = diffEl?.textContent?.trim() ?? "";

  return { title, difficulty };
}

export function scrapeTestResult(): "passed" | "failed" | "runtime_error" | null {
  // Watch for LeetCode result panel
  const accepted = document.querySelector('[data-e2e-locator="submission-result"]');
  if (!accepted) return null;

  const text = accepted.textContent?.toLowerCase() ?? "";
  if (text.includes("accepted")) return "passed";
  if (text.includes("runtime error")) return "runtime_error";
  if (text.includes("wrong answer") || text.includes("time limit")) return "failed";
  return null;
}

export function scrapeDiagnostics(): string[] {
  const errors: string[] = [];

  // Compilation/runtime errors shown in result panel
  const errorEls = document.querySelectorAll(
    ".error-message, [class*='error'], [class*='Error']"
  );
  errorEls.forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length < 200) errors.push(text);
  });

  return errors.slice(0, 5);
}
