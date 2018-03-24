import {Observable} from 'rxjs/Rx';
import * as uuid from 'uuid/v4';
import {DatabaseService} from './db';
import {UserSession} from '../models/auth';

const EXPIRATION_SECONDS = (30 * 24 * 60 * 60); // 30 day expiration for now

export class SessionManager {
    constructor (private _db: DatabaseService) {}

    getUserSession(sessionKey: string): Observable<UserSession> {
        const q = 'Select u.UserId, u.Email, s.SessionKey, s.Expires from `sessions` s'
        + ' join `users` u on u.UserId = s.UserId'
        + ' where s.Active=1 AND u.Active=1 AND s.SessionKey=? AND s.Expires > ? LIMIT 1;';
        return this._db.query(q, [sessionKey, Math.floor(new Date().valueOf()/1000)])
        .map(sessions => sessions.length ? sessions[0] : null);
    }

    createSession(userId: number): Observable<{SessionKey: string, Expires: number}> {
        const sessionId = uuid().replace(/\-/ig, '');
        const expires = Math.floor(new Date().valueOf()/1000) + EXPIRATION_SECONDS; // 30 day expiration for now
        return this._db.query('Insert into `sessions` (`SessionKey`, `UserId`, `Expires`, `Active`) VALUES (?, ?, ?, 1);', [sessionId, userId, expires])
        .map(_ => ({SessionKey: sessionId, Expires: expires}));
    }

    deactivateSession(sessionKey: string): Observable<any> {
        return this._db.query('Update `sessions` set `Active`=0 where `SessionKey`=?', [sessionKey]);
    }
}
