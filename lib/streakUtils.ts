export async function awardExerciseCredits(
  userId: string,
  amount: number
): Promise<{ creditsAwarded: number; message: string; newBalance?: number }> {
  const creditsAwarded = amount;

  const awardRes = await fetch("/api/award-credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: creditsAwarded, reason: "exercise_reward" })
  });

  if (!awardRes.ok) {
    const errorData = await awardRes.json();
    throw new Error(errorData.error || "Failed to award credits");
  }

  const awardData = await awardRes.json();

  return {
    creditsAwarded,
    message: `Ai câștigat ${creditsAwarded} ${creditsAwarded === 1 ? 'token' : 'tokeni'}!`,
    newBalance: awardData.newBalance
  };
}
