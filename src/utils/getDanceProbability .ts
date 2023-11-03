export async function getDanceProbability(): Promise<{ result: number }> {
  return (await fetch("http://localhost:4001/current")).json() as Promise<{
    result: number;
  }>;
}
