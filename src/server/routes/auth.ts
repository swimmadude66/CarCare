import {Router} from 'express';
import {createHash} from 'crypto';
import * as uuid from 'uuid/v4';
import {Observable} from 'rxjs/Rx';
import {Config} from '../models/config';
import {LoggedError} from '../models/error';

const COOKIE_OPTIONS = {
    path: '/',
    httpOnly: true,
    signed: true,
    sameSite: true,
};

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;
    const sessionManager = APP_CONFIG.sessionManager;

    router.post('/signup', (req, res, next) => {
        const body = req.body;
        if (!body || !body.Email || !body.Password) {
            return res.status(400).send('Email and Password are required fields');
        } else {
            const salt = uuid().replace(/-/ig, '');
            const passHash = createHash('sha512').update(`${salt}|${body.Password}`).digest('hex');
            db.query('Insert into `users` (`Email`, `Salt`, `PassHash`, `Active`) VALUES(?, ?, ?, 1);', [body.Email, salt, passHash])
            .flatMap(result => sessionManager.createSession(result.insertId, JSON.stringify(res.useragent)))
            .subscribe(
                result => {
                    res.cookie(APP_CONFIG.cookie_name, result.SessionKey, {...COOKIE_OPTIONS, expires: new Date(result.Expires * 1000), secure: req.secure});
                    return res.send();
                },
                err => next(new LoggedError(err, 'Could not complete signup', 400)) // return a 400 always to avoid user enumeration
            );
        }
    });

    router.post('/login', (req, res, next) => {
        const body = req.body;
        if (!body || !body.Email || !body.Password) {
            return res.status(400).send('Email and Password are required fields');
        } else {
            db.query('Select `PassHash`, `UserId`, `Salt` from `users` where `Active`=1 AND `Email`=? LIMIT 1;', [body.Email])
            .flatMap(
                (users: any[]) => {
                    let user = {UserId: -100, PassHash: '12345', Salt: '12345'}; // use a fake user which will fail to avoid timing differences indicating existence of real users.
                    if (users.length > 0) {
                        user = users[0]
                    }
                    const compHash = createHash('sha512').update(`${user.Salt}|${body.Password}`).digest('hex');
                    if (compHash === user.PassHash) {
                        return sessionManager.createSession(user.UserId, JSON.stringify(res.useragent));
                    } else {
                        return Observable.throw('Incorrect username or password');
                    }
                }
            ).subscribe(
                result => {
                    res.cookie(APP_CONFIG.cookie_name, result.SessionKey, {...COOKIE_OPTIONS, expires: new Date(result.Expires * 1000), secure: req.secure});
                    return res.send();
                },
                err => {
                    if (err === 'Incorrect username or password') {
                        return next(new LoggedError(err, 'Incorrect username or password', 400));
                    } else {
                        return next(new LoggedError(err, 'Could not login at this time', 500));
                    }
                }
            )
        }
    });

    router.get('/valid', (req, res) => {
        return res.send(!!res.locals.usersession);
    });

    router.get('/sessions', (req, res, next) => {
        if (!res.locals.usersession || !res.locals.usersession.UserId) {
            return res.send([]);
        }
        sessionManager.getActiveSessions(res.locals.usersession.UserId)
        .subscribe(
            sessions => res.send(sessions),
            err => next(new LoggedError(err, 'Cannot fetch active sessions', 500))
        )
    });

    router.delete('/sessions/:sessionKey', (req, res, next) => {
        const sessionKey = req.params['sessionKey'];
        if (res.locals.usersession && res.locals.usersession.UserId && res.locals.usersession.SessionKey) {
            sessionManager.deactivateSession(res.locals.usersession.UserId, sessionKey)
            .subscribe(
                success => {
                    if (success) {
                        if (res.locals.usersession.SessionKey === sessionKey) {
                            res.clearCookie(APP_CONFIG.cookie_name, {...COOKIE_OPTIONS, secure: req.secure});
                        }
                        return res.send(success);
                    } else {
                        return res.status(400).send('Could not find that session');
                    }
                },
                err => next(new LoggedError(err, 'Could not lookup that session', 500))
            )
        }
    });

    router.post('/logout', (req, res, next) => {
        if (res.locals.usersession && res.locals.usersession.SessionKey && res.locals.usersession.UserId) {
            res.clearCookie(APP_CONFIG.cookie_name, {...COOKIE_OPTIONS, secure: req.secure});
            sessionManager.deactivateSession(res.locals.usersession.UserId, res.locals.usersession.SessionKey)
            .finally(() => res.send(true))
            .subscribe(
                _ => _,
                err => console.error(err)
            );
        } else {
           return res.send(false);
        }
    });

    return router;
}
