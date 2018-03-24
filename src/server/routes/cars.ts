import {Router} from 'express';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;

    // Get all cars in garage
    router.get('/', (req, res) => {
        const userId = res.locals.usersession.UserId;
    });

    return router;
}
