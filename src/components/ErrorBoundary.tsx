"use client";
import React, { Component, type ReactNode } from "react";

import { logger } from "~/internal/logger";

import { ErrorView } from "./views/ErrorView";

interface Props {
  readonly children?: ReactNode;
  readonly message?: string;
  readonly title?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public async componentDidCatch(error: Error) {
    logger.error(error, "Uncaught Error");
  }

  public render() {
    if (this.state.hasError) {
      const message =
        this.props.message ??
        "An unknown error occurred. We will get to the bottom of it, your patience is appreciated!";
      return <ErrorView title={this.props.title ?? "Error"}>{message}</ErrorView>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
