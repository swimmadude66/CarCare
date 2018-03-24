import {Router} from 'express';
import {createHash} from 'crypto';
import * as uuid from 'uuid/v4';
import {Observable} from 'rxjs/Rx';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;
    const sessionManager = APP_CONFIG.sessionManager;

    router.post('/signup', (req, res) => {
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
                    res.cookie(APP_CONFIG.cookie_name, result.SessionKey, {
                        expires: new Date(result.Expires * 1000),
                        path: '/',
                        httpOnly: true,
                        secure: req.secure,
                        signed: true,
                        sameSite: true,
                    });
                    return res.send();
                },
                err => {
                    console.error(err);
                    res.status(400).send('Could not complete signup');
                }
            );
        }
    });

    router.post('/login', (req, res) => {
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
                    res.cookie(APP_CONFIG.cookie_name, result.SessionKey, {
                        expires: new Date(result.Expires * 1000),
                        path: '/',
                        httpOnly: true,
                        secure: req.secure,
                        signed: true,
                        sameSite: true,
                    });
                    return res.send();
                },
                err => {
                    if (err === 'Incorrect username or password') {
                        return res.status(400).send('Incorrect username or password');
                    } else {
                        console.error(err);
                        return res.status(500).send('Could not login at this time');
                    }
                }
            )
        }
    });

    router.get('/valid', (req, res) => {
        return res.send(!!res.locals.usersession);
    });

    router.post('/logout', (req, res) => {
        if (res.locals.usersession && res.locals.usersession.SessionKey) {
            sessionManager.deactivateSession(res.locals.usersession.SessionKey)
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
