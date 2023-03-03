import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";

export class RouteGuards {
    private static firstTimeSeeingStartup = true;

    public static startupPageGuard(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let canProceed = RouteGuards.firstTimeSeeingStartup;
        if (RouteGuards.firstTimeSeeingStartup && next.routeConfig?.path == '')
            RouteGuards.firstTimeSeeingStartup = false;
        return canProceed;
    }
}
