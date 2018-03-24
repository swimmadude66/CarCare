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
                .map(metadataMap=> cars.map(c => c.Metadata = metadataMap[c.CarId]));
            }
        )
    }

    addUpdateCar(userId: number, car: Car): Observable<any> {
        const q = 'Insert into `cars` (`CarId`, `Make`, `Model`, `Trim`, `Color`, `Owner`, `CarName`, `License`, `VIN`, `PurchaseDate`, `CarPhoto`)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        + ' ON DUPLICATE KEY UPDATE `Make`=VALUES(`Make`), `Model`=VALUES(`Model`), `Trim`=VALUES(`Trim`), `Color`=VALUES(`Color`), `Owner`=VALUES(`Owner`),'
        + ' `CarName`=VALUES(`CarName`), `License`=VALUES(`License`), `VIN`=VALUES(`VIN`), `PurchaseDate`=VALUES(`PurchaseDate`), `CarPhoto`=VALUES(`CarPhoto`);';
        return this._db.query(q, [car.CarId, car.Make, car.Model, car.Trim, car.Color, userId, car.CarName, car.License, car.VIN, car.PurchaseDate, car.CarPhoto])
        .flatMap(result => {
            const carId = result.insertId;
            if (car.Metadata && Object.keys(car.Metadata).length) {
                return this._mapMetadata(carId, car.Metadata).map(_ => carId);
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
}
