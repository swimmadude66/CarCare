import {DatabaseService} from './db';
import {Car} from '../models/car';
import {Observable} from 'rxjs/Rx';

type CarMetadata = {[CarId: number]: {[key: string]: string}};

export class CarService {
    constructor(private _db: DatabaseService) {}

    getCars(userId: number): Observable<Car[]> {
        return this._db.query('Select * from `cars` where `Owner`=?;', [userId])
        .flatMap(
            (cars: Car[]) => {
                if (!cars || cars.length < 1) {
                    return Observable.of([]);
                }
                const carIds = cars.map(c => c.CarId);
                return this._getMetadata(carIds)
                .map(metadataMap=> {
                    cars.forEach(c => c.Metadata = metadataMap[c.CarId]);
                    return cars;
                });
            }
        )
    }

    getCar(userId: number, carId: number): Observable<Car> {
        return this._db.query('Select * from `cars` WHERE `Owner`=? and `CarId`=? LIMIT 1;', [userId, carId])
        .flatMap(
            cars => {
                if (!cars || cars.length < 1) {
                    return Observable.throw('No such car');
                }
                const car = cars[0];
                return this._getMetadata([car.CarId])
                .map(metadataMap=> {
                    car.Metadata = metadataMap[car.CarId];
                    return car;
                });
            }
        );
    }

    addCar(userId: number, car: Car): Observable<number> {
        const q = 'Insert into `cars` (`Make`, `Model`, `Trim`, `Color`, `Owner`, `CarName`, `License`, `VIN`, `PurchaseDate`, `CarPhoto`)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        return this._db.query(q, [car.Make, car.Model, car.Trim, car.Color, userId, car.CarName, car.License, car.VIN, car.PurchaseDate, car.CarPhoto])
        .flatMap(result => {
            const carId = result.insertId;
            if (carId && car.Metadata && Object.keys(car.Metadata).length) {
                return this._mapMetadata(carId, car.Metadata).map(_ => carId);
            } else {
                return Observable.of(carId);
            }
        });
    }

    updateCar(userId: number, car: Car): Observable<number> {
        const carId = car.CarId;
        delete car.Owner;
        delete car.CarId;
        const q = 'Update `cars`, SET ? WHERE `Owner`=? and `CarId`=?;';
        return this._db.query(q, [car, userId, carId])
        .flatMap(result => {
            if (result.affectedRows) {
                if(car.Metadata && Object.keys(car.Metadata).length) {
                    return this._mapMetadata(carId, car.Metadata)
                    .flatMap(_ => this._removeExtraMetadata(carId, car.Metadata))
                    .map(_ => carId);
                } else {
                    return this._removeExtraMetadata(carId, car.Metadata).map(_ => carId);
                }
            } else {
                return Observable.of(carId);
            }
        });
    }

    deleteCar(userId: number, carId: number): Observable<any> {
        return this._db.query('Delete from `cars` WHERE `CarId`=? AND `Owner`=?;', [carId, userId])
        .flatMap(result => {
            if (result.affectedRows) {
                return this._removeExtraMetadata(carId, {}).map(_ => carId);
            } else {
                return Observable.of(carId);
            }
        });
    }


    private _getMetadata(carIds: number[]): Observable<CarMetadata> {
        return this._db.query('Select * from `car_metadata` Where `CarId` in (?)', [carIds])
        .map(metadata => {
            if (!metadata || metadata.length < 1) {
                return {};
            }
            return metadata.reduce((curr: any, prev: CarMetadata) => {
                if (!(curr.CarId in prev)) {
                    prev[curr.CarId] = {};
                }
                prev[curr.CarId][curr.Key] = curr.Value;
            }, {});
        });
    }

    private _mapMetadata(carId: number, metadata: {[Key: string]: string}): Observable<any> {
        const rows = Object.keys(metadata).map(mk => [carId, mk, metadata[mk]]);
        const q = 'Insert into `car_metadata` (`CarId`, `Key`, `Value`) VALUES (' 
        + this._db.escape(rows) 
        + ') ON DUPLICATE KEY UPDATE `Value`=VALUES(`Value`);';
        return this._db.query(q);
    }

    private _removeExtraMetadata(carId: number, metadata: {[Key: string]: string}): Observable<any> {
        const keys = Object.keys(metadata);
        if (!metadata || !keys || keys.length < 1) {
            return Observable.of({});
        }
        const q = 'Delete from `car_metadata` Where `CarId`=? AND `Key` not in (?)';
        return this._db.query(q, [carId, keys]);
    }
}
