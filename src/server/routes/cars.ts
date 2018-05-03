import {Router} from 'express';
import {Config} from '../models/config';
import { CarService } from '../services/car';
import {LoggedError} from '../models/error';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;
    const carService = new CarService(db);

    // Get all cars in garage
    router.get('/', (req, res, next) => {
        const userId = res.locals.usersession.UserId;
        carService.getCars(userId)
        .subscribe(
            cars => res.send(cars),
            err => next(new LoggedError(err, 'Could not retrieve cars', 500))
        )
    });

    router.post('/', (req, res, next) => {
        const body = req.body;
        if (!body || !body.Make || !body.Model || !body.Color) {
            return res.status(400).send('Make, Model, and Color are required fields');
        }
        carService.addCar(res.locals.usersession.UserId, body)
        .subscribe(
            carId => res.status(200).send(true),
            err => next(new LoggedError(err, 'Could not add a car at this time', 500))
        );
    });

    router.get('/:carId', (req, res, next) => {
        const carId = +req.params.carId;
        const userId = res.locals.usersession.UserId;
        carService.getCar(userId, carId).subscribe(
            car => res.send(car),
            err => {
                if (err === 'No such car') {
                    next(new LoggedError(err, 400));
                }
                return new LoggedError(err, 'Could not lookup car', 500);
            }
        );
    });

    router.post('/:carId', (req, res, next) => {
        const body = req.body;
        if (!body || !body.Make || !body.Model || !body.Color) {
            return res.status(400).send('Make, Model, and Color are required fields');
        }
        body.CarId = +req.params['carId'];
        carService.updateCar(res.locals.usersession.UserId, body)
        .subscribe(
            carId => res.status(200).send(true),
            err => next(new LoggedError(err, 'Could not update car at this time', 500))
        )
    });

    router.delete('/:carId', (req, res, next) => {
        const carId = +req.params['carId'];
        carService.deleteCar(res.locals.usersession.UserId, carId)
        .subscribe(
            _ => res.status(200).send(true),
            err => next(new LoggedError(err, 'Could not delete car', 500))
        )
    });

    return router;
}
