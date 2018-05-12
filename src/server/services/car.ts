import {DatabaseService} from './db';
import {Car} from '../models/car';
import {Observable, of as ObservableOf} from 'rxjs';
import {map, flatMap} from 'rxjs/operators';

type CarMetadata = {[CarId: number]: {[key: string]: string}};

export class CarService {
    constructor(private _db: DatabaseService) {}

    getCars(userId: number): Observable<Car[]> {
        return this._db.query('Select * from `cars` where `Owner`=?;', [userId])
        .pipe(
            flatMap(
                (cars: Car[]) => {
                    if (!cars || cars.length < 1) {
                        return ObservableOf([]);
                    }
                    const carIds = cars.map(c => c.CarId);
                    return this._getMetadata(carIds)
                    .pipe(
                        map(metadataMap=> {
                            cars.forEach(c => c.Metadata = metadataMap[c.CarId]);
                            return cars;
                        })
                    );
                }
            )
        );
    }

    getCar(userId: number, carId: number): Observable<Car> {
        return this._db.query('Select * from `cars` WHERE `Owner`=? and `CarId`=? LIMIT 1;', [userId, carId])
        .pipe(
            flatMap(
                (cars: any[]) => {
                    if (!cars || cars.length < 1) {
                        return Observable.throw('No such car');
                    }
                    const car = cars[0];
                    return this._getMetadata([car.CarId])
                    .pipe(
                        map(metadataMap=> {
                            car.Metadata = metadataMap[car.CarId];
                            return car;
                        })
                    );
                }
            )
        );
    }

    addCar(userId: number, car: Car): Observable<number> {
        const q = 'Insert into `cars` (`Make`, `Model`, `Trim`, `Color`, `Owner`, `CarName`, `License`, `VIN`, `PurchaseDate`, `CarPhoto`)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        return this._db.query(q, [car.Make, car.Model, car.Trim, car.Color, userId, car.CarName, car.License, car.VIN, car.PurchaseDate, car.CarPhoto])
        .pipe(
            flatMap((result: any) => {
                const carId = result.insertId;
                if (carId && car.Metadata && Object.keys(car.Metadata).length) {
                    return this._mapMetadata(carId, car.Metadata).pipe(map(_ => carId));
                } else {
                    return ObservableOf(carId);
                }
            })
        );
    }

    updateCar(userId: number, car: Car): Observable<number> {
        const carId = car.CarId;
        delete car.Owner;
        delete car.CarId;
        const q = 'Update `cars`, SET ? WHERE `Owner`=? and `CarId`=?;';
        return this._db.query(q, [car, userId, carId])
        .pipe(
            flatMap((result: any) => {
                if (result.affectedRows) {
                    if(car.Metadata && Object.keys(car.Metadata).length) {
                        return this._mapMetadata(carId, car.Metadata)
                        .pipe(
                            flatMap(_ => this._removeExtraMetadata(carId, car.Metadata)),
                            map(_ => carId)
                        );
                    } else {
                        return this._removeExtraMetadata(carId, car.Metadata).pipe(map(_ => carId));
                    }
                } else {
                    return ObservableOf(carId);
                }
            })
        );
    }

    deleteCar(userId: number, carId: number): Observable<any> {
        return this._db.query('Delete from `cars` WHERE `CarId`=? AND `Owner`=?;', [carId, userId])
        .pipe(
            flatMap((result: any) => {
                if (result.affectedRows) {
                    return this._removeExtraMetadata(carId, {}).pipe(map(_ => carId));
                } else {
                    return ObservableOf(carId);
                }
            })
        );
    }


    private _getMetadata(carIds: number[]): Observable<CarMetadata> {
        return this._db.query('Select * from `car_metadata` Where `CarId` in (?)', [carIds])
        .pipe(
            map((metadata: any[]) => {
                if (!metadata || metadata.length < 1) {
                    return {};
                }
                return metadata.reduce((curr: any, prev: CarMetadata) => {
                    if (!(curr.CarId in prev)) {
                        prev[curr.CarId] = {};
                    }
                    prev[curr.CarId][curr.Key] = curr.Value;
                }, {});
            })
        );
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
            return ObservableOf({});
        }
        const q = 'Delete from `car_metadata` Where `CarId`=? AND `Key` not in (?)';
        return this._db.query(q, [carId, keys]);
    }
}
