import { createInterface } from "readline";

/**
 * Prompts the user for confirmation
 * @param question Question to ask the user
 * @returns Promise that resolves to true if user confirms, false otherwise
 */
export async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question + " (y/N) ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}
