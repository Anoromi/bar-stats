export class InterruptedException extends Error {}

export async function crashInterrupted(on: Promise<boolean>, message: string = "Interrupted") {
  if (await on) throw new InterruptedException(message);
}

