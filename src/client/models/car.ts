export interface Car {
    CarId?: number;
    Owner?: number;
    Make: string;
    Model: string;
    Trim?: string;
    Color: string;
    CarName?: string;
    License?: string;
    VIN?: string;
    PurchaseDate?: Date;
    CarPhoto?: string;
    Metadata?: {[key: string]: string};
}
