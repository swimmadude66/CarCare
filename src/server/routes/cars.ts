import {Router} from 'express';
import {Config} from '../models/config';
import { CarService } from '../services/car';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;
    const carService = new CarService(db);

    // Get all cars in garage
    router.get('/', (req, res) => {
        const userId = res.locals.usersession.UserId;
        carService.getCars(userId)
        .subscribe(
            cars => res.send(cars),
            err => {
                console.error(err);
                res.status(500).send('Could not retrieve cars');
            }
        )
    });

    return router;
}
