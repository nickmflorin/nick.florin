export class UnreachableCaseError extends Error {
  constructor(message?: string) {
    super(message ? `Unreachable Case: ${message}` : "Unreachable Case!");
    this.name = "UnreachableCaseError";
  }
}
