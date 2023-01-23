import {Injectable} from '@angular/core';
import {Preferences} from '@capacitor/preferences';
import {BehaviorSubject, Observable} from 'rxjs';
import {AppInfo} from "../interfaces/app-info";
import {AppConfig} from "../classes/app-config";

@Injectable({
    providedIn: 'root'
})
export class AppInfoService {
    private static readonly appConfigStorageKey = "appConfig";
    private static appInfo = new BehaviorSubject<AppInfo | null>(null);
    private static appConfig = new BehaviorSubject<AppConfig>(new AppConfig());

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

    /**
     * Loads the appConfig object from the permanent storage and pushes it, notifying any listener.
     */
    public static async LoadAppConfig() {
        let {value} = await Preferences.get({key: this.appConfigStorageKey});
        if (value)
            this.appConfig.next(JSON.parse(value));
    }

    /**
     * Saves the appConfig Object into the permanent storage.
     */
    public static async SaveAppConfig() {
        await Preferences.set({key: this.appConfigStorageKey, value: JSON.stringify(this.appConfig.value)});
    }

    /**
     * Pushes new information into appConfig and notifies every listener.
     * @param appConfig the new information for appConfig.
     */
    public static async PushAppConfig(appConfig: AppConfig) {
        this.appConfig.next(appConfig);
        await this.SaveAppConfig();
    }

    /**
     * @returns an observable for the appConfig object.
     */
    public static GetAppConfigObservable(): Observable<AppConfig> {
        return this.appConfig.asObservable();
    }

    /**
     * @returns the current value of the appConfig object.
     */
    public static GetAppConfig(): AppConfig {
        return this.appConfig.value;
    }
}
