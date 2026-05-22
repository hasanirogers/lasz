import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { StoreApi } from 'zustand';

export class ZustandController<S, D, A = void> implements ReactiveController {
  private _unsubcribe?: () => void;
  public data!: D;
  public actions?: A;

  constructor(
    private host: ReactiveControllerHost,
    private store: StoreApi<S>,
    private selector: (state: S) => D,
    actionsSelector?: (state: S) => A 
  ) {
    this.host.addController(this);

    // we're divided up our state into two categories
    // "data" and "actions"
    // read data such as a todo list
    /// actions set data such as adding to a todo list
    
    // Initializing data
    const initialState = this.store.getState();
    this.data = selector(initialState);
    
    // Initializing actions (if provided)
    if (actionsSelector) {
      this.actions = actionsSelector(initialState);
    }
  }

  // called when element is added to the page
  hostConnected() {
     // .subscribe() returns a clean up function that we can store and call later
     this._unsubcribe = this.store.subscribe((state: S) => {
      this.data = this.selector(state);
      this.host.requestUpdate();
    });
  } 

  // called when element is removed from the page
  hostDisconnected() {
    // prevent memory leaks by unsubscribing when disconnected
    this._unsubcribe?.();
  }
}
