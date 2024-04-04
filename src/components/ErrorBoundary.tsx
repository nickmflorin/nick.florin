"use client";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorView } from "./views/error/ErrorView";

interface Props {
  readonly children?: ReactNode;
  readonly fallback?: JSX.Element;
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

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const logger = (await import("~/application/logger")).logger;
    logger.error("Uncaught Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorView title={this.props.title ?? "Error"}>
          {this.props.message ??
            "An unknown error occurred. We will get to the bottom of it, your patience is " +
              "appreciated!"}
        </ErrorView>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
