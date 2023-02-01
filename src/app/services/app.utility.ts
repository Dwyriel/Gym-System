import {Subscription} from "rxjs";
import {AccountService} from "./account.service";

export function getRemSizeInPixels() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function clamp(value: number, min: number, max: number) {
    if (min > max) {
        let temp = min;
        min = max;
        max = temp;
    }
    if (value < min)
        value = min;
    if (value > max)
        value = max;
    return value;
}

export function lerp(value: number, min: number, max: number) {
    if (min > max) {
        let temp = min;
        min = max;
        max = temp;
    }
    return min * (1 - value) + max * value;
}

export function inverseLerp(value: number, min: number, max: number) {
    if (min > max) {
        let temp = min;
        min = max;
        max = temp;
    }
    return clamp((value - min) / (max - min), 0, 1);
}

export function fromOneRangeToAnother(value: number, minFirstRange: number, maxFirstRange: number, minSecondRange: number, maxSecondRange: number) {
    if (minFirstRange > maxFirstRange) {
        let temp = minFirstRange;
        minFirstRange = maxFirstRange;
        maxFirstRange = temp;
    }
    if (minSecondRange > maxSecondRange) {
        let temp = minSecondRange;
        minSecondRange = maxSecondRange;
        maxSecondRange = temp;
    }
    return lerp(inverseLerp(value, minFirstRange, maxFirstRange), minSecondRange, maxSecondRange);
}

export function UnsubscribeIfSubscribed(subscription?: Subscription) {
    if (subscription && !subscription.closed)
        subscription.unsubscribe();
}

export async function waitForFirebaseResponse(accountService: AccountService) {
    do await new Promise(resolve => setTimeout(resolve, 10)); while (typeof accountService.CurrentUser == "boolean");
    return Boolean(accountService.CurrentUser);
}
