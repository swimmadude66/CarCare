export interface Error {
    originalError: any;
    status: number;
    message: string;
}


export class LoggedError implements Error {
    originalError: any;
    status: number = 500;
    message: string;

    constructor(err: any, message?: any, status?: number) {
        this.originalError = err;
        if (status || status === 0) {
            this.status = status;
        }
        if (typeof message === 'string') {
            this.message = message;
        } else {
            try {
                this.message = JSON.stringify(message);
            } catch (e) {
                try {
                    this.message = JSON.stringify(err);
                } catch (e) {
                    this.message = '';
                }
            }
        }
    }
}
