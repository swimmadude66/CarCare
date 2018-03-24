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

    router.post('/', (req, res) => {
        const body = req.body;
        if (!body || !body.Make || !body.Model || !body.Color) {
            return res.status(400).send('Make, Model, and Color are required fields');
        }
        carService.addCar(res.locals.usersession.UserId, body)
        .subscribe(
            _ => res.send(true),
            err => {
                console.error(err);
                return res.status(500).send('Could not add a car at this time');
            }
        );
    });

    router.post('/:carId', (req, res) => {
        const body = req.body;
        if (!body || !body.Make || !body.Model || !body.Color) {
            return res.status(400).send('Make, Model, and Color are required fields');
        }
        body.CarId = req.params['carId'];
        carService.updateCar(res.locals.usersession.UserId, body)
        .subscribe(
            _ => res.send(true),
            err => {
                console.error(err);
                return res.status(500).send('Could not update car at this time');
            }
        )
    });

    router.delete('/:carId', (req, res) => {
        const carId = req.params['carId'];
        carService.deleteCar(res.locals.usersession, carId)
        .subscribe(
            _ => res.send(true),
            err => {
                console.error(err);
                res.status(500).send('Could not delete car');
            }
        )
    });

    return router;
}
