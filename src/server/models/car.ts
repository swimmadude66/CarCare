export interface Car {
    CarId?: number; // int(11) NOT NULL AUTO_INCREMENT,
    Owner?: number; // int(11) NOT NULL,
    Make: string;// varchar(32) NOT NULL,
    Model: string; // varchar(32) NOT NULL,
    Trim?: string; // varchar(32) DEFAULT NULL,
    Color: string; // varchar(32) NOT NULL,
    CarName?: string; // varchar(64) DEFAULT NULL,
    License?: string; // varchar(32) DEFAULT NULL,
    VIN?: string; // varchar(64) DEFAULT NULL,
    PurchaseDate?: Date; // date DEFAULT NULL,
    CarPhoto?: string; // text,
    Metadata?: {[key: string]: string}; // MAPPED FROM EXTERNAL TABLE
}
