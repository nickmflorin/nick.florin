import * as types from "./types";

export class GithubClient<U extends string> {
  private readonly username: U;

  constructor(username: U) {
    this.username = username;
  }

  async fetchRepositories(): Promise<types.GithubRepo<U>[]> {
    const url = `${types.GITHUB_BASE_URL}/users/${this.username}/repos`;
    const response = await fetch(url);
    return await response.json();
  }
}

export const githubClient = new GithubClient("nickmflorin");
