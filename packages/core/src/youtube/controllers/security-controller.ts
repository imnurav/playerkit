import { SecurityManager } from "../../shared/security-manager";
import type { SecurityConfig } from "../../types/player.types";
import type { PlayerStore } from "../../shared/store";

/**
 * Handles security enforcement settings (DevTools checks, click blocking)
 * for the YouTube player instance.
 */
export class SecurityController {
  private securityManager: SecurityManager | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly store: PlayerStore,
    private readonly controls: any,
  ) {}

  /** Initialize or update the security policy configuration. */
  setSecurityConfig(config: SecurityConfig): void {
    if (this.securityManager) this.securityManager.destroy();

    this.store.setState({ isDevtoolsDetected: false });
    this.securityManager = new SecurityManager({
      root: this.root,
      video: null, // YouTube ignores native video element block - uses overlay CSS
      store: this.store,
      controls: this.controls,
      disableDevOptions: config.disableDevOptions,
    });
  }

  /** Tear down active security listeners. */
  destroy(): void {
    if (this.securityManager) {
      this.securityManager.destroy();
      this.securityManager = null;
    }
  }
}
