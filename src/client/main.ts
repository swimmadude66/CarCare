import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './modules/app';
import {Environment} from './environments/environment';

let opts: any = {};
if (Environment.isProduction) {
    enableProdMode();
    opts.preserveWhitespaces = false;
}
platformBrowserDynamic().bootstrapModule(AppModule, opts);
