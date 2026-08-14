import JsdomEnvironment from 'jest-environment-jsdom';

/**
 * The web platform globals that Node provides but jsdom does not implement.
 *
 * They are needed because importing anything from the `~/components/types` barrel reaches
 * `~/internal/logger`, which reaches `~/api` and in turn `next/server` - and `next/server`
 * subclasses `Request` at module scope, so merely loading a component throws
 * `ReferenceError: Request is not defined` in a stock jsdom environment.
 */
const MissingWebGlobals = {
  fetch,
  FormData,
  Headers,
  ReadableStream,
  Request,
  Response,
  TextDecoder,
  TextEncoder,
  TransformStream,
};

/**
 * A jsdom environment that additionally exposes the {@link MissingWebGlobals} to the sandbox the
 * RTL tests run in.
 *
 * A test environment module is evaluated in the Node realm rather than in the sandbox it
 * constructs, which is what makes Node's implementations reachable here and nowhere else in the
 * suite.
 */
export default class RtlTestEnvironment extends JsdomEnvironment {
  public async setup(): Promise<void> {
    await super.setup();
    for (const [name, value] of Object.entries(MissingWebGlobals)) {
      if (!(name in this.global)) {
        Object.defineProperty(this.global, name, { configurable: true, value, writable: true });
      }
    }
  }
}
