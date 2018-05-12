import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Car} from '@models/car';

@Injectable()
export class CarsService {

    constructor(
        private _http: HttpClient
    ) {}

    getCars(): Observable<Car[]> {
        return this._http.get<Car[]>('/api/cars');
    }

    getCar(carId: number): Observable<Car> {
        return this._http.get<Car>(`/api/car/${carId}`);
    }

    addCar(car: Car): Observable<number> {
        return this._http.post<number>('/api/cars/', car);
    }

    updateCar(carId: number, car: Car): Observable<number> {
        return this._http.post<number>(`/api/cars/${carId}`, car);
    }

    deleteCar(carId: number): Observable<boolean> {
        return this._http.delete<boolean>(`/api/cars/${carId}`);
    }
}
