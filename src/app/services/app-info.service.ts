import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AppInfo} from "../interfaces/app-info";

@Injectable({
    providedIn: 'root'
})
export class AppInfoService {
    private static appInfo = new BehaviorSubject<AppInfo | null>(null);

    constructor() { }

    /**
     * Pushes new information into appInfo and notifies every listener.
     * @param appInfo the new information for appInfo.
     */
    public static PushAppInfo(appInfo: AppInfo) {
        this.appInfo.next(appInfo);
    }

    /**
     * @returns an observable for the appInfo object.
     */
    public static GetAppInfoObservable(): Observable<AppInfo | null> {
        return this.appInfo.asObservable();
    }

    /**
     * @returns the current value of the appInfo object.
     */
    public static GetAppInfo(): AppInfo | null {
        return this.appInfo.value;
    }
}
