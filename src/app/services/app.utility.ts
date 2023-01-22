import {Subscription} from "rxjs";

export function UnsubscribeIfSubscribed(subscription?: Subscription) {
    if (subscription && !subscription.closed)
        subscription.unsubscribe();
}

export class AppUtility {
}
