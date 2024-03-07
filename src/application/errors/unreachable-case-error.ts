export class UnreachableCaseError extends Error {
  constructor() {
    super("Unreachable Case!");
    this.name = "UnreachableCaseError";
  }
}
