import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './modules/app';

let opts: any = {};
if (process.env.PROD_MODE) {
    enableProdMode();
    opts.preserveWhitespaces = false;
}
platformBrowserDynamic().bootstrapModule(AppModule, opts);