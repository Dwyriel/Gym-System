import {Injectable} from '@angular/core';
import {Auth, User, onAuthStateChanged, signInWithEmailAndPassword} from "@angular/fire/auth";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private user = new BehaviorSubject<User | null | boolean>(false);

    constructor(private auth: Auth) {
        onAuthStateChanged(this.auth, user => this.user.next(user));
    }

    /**
     * @returns an observable for the user object.
     */
    public GetUserObservable() {
        return this.user.asObservable();
    }

    /**
     * @returns the current value of the user object.
     */
    public GetCurrentUser() {
        return this.auth.currentUser;
    }

    public Login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    /**
     * Logs out the currently logged user, if there is one.
     * @returns A promise that indicates if the logout was successfully logged out or not. Always returns true if there's no current logged-in user.
     */
    public async Logout() {
        let wasSuccessful = true;
        if (this.auth.currentUser)
            await this.auth.signOut().then(() => wasSuccessful = true).catch(() => wasSuccessful = false);
        return wasSuccessful;
    }
}
