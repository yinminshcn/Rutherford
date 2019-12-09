import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {SwiperModule} from 'ngx-swiper-wrapper';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

import {YbingPage} from './ybing.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FontAwesomeModule,
        SwiperModule,
        RouterModule.forChild([
            {
                path: '',
                component: YbingPage
            }
        ])
    ],
    declarations: [YbingPage]
})
export class YbingPageModule {
}
