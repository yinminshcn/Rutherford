import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {Media} from '@ionic-native/media/ngx';
import {SwiperModule} from 'ngx-swiper-wrapper';

import {LocalhostService} from './localhost.service';
import {AndroidExoplayer} from '@ionic-native/android-exoplayer/ngx';
import {File} from '@ionic-native/file/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faCoffee, faVolumeOff, faVolumeDown, faVolumeUp, faTrashAlt} from '@fortawesome/free-solid-svg-icons';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        FontAwesomeModule,
        SwiperModule,
        IonicModule.forRoot(),
        AppRoutingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        LocalhostService,
        Media,
        File,
        AndroidPermissions,
        AndroidExoplayer,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        library.add(faCoffee);
        library.add(faVolumeOff);
        library.add(faVolumeDown);
        library.add(faVolumeUp);
        library.add(faTrashAlt);
    }
}
