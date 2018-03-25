import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    imports:[
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    exports: [
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
    ]
})
export class SharedModule {}
