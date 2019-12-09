import {Component, OnInit} from '@angular/core';
import {LocalhostService} from '../localhost.service';
import {Platform} from '@ionic/angular';
import {YPlayerParamEntry} from '../entries/YPlayerParamEntry';
import {YBingParamEntry} from '../entries/YBingParamEntry';
import {getConnection} from 'typeorm';
import {YPlayerConfig} from '../entries/YPlayerConfig';
import {YBingConfig} from '../entries/YBingConfig';

@Component({
    selector: 'app-list',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
    constructor(public localSvr: LocalhostService, public platform: Platform) {
    }

    ngOnInit() {
        this.platform.ready().then(async () => {
            if (this.localSvr.isAndroid) {
                await this.localSvr.sqlService;
                /*
                console.log('sqlite is ready for list module');
                const connect = getConnection();
                console.log('get sqlite connection');
                const runits = await connect.manager.find(YPlayerParamEntry, {extra: 0});
                if (runits.length === 0) {
                    const unit = new YPlayerParamEntry();
                    unit.extra = 0;
                    unit.text = JSON.stringify(this.localSvr.yplayerConfig);
                    await connect.manager.save(unit);
                } else {
                    const unit = runits[0];
                    let config: YPlayerConfig;
                    config = JSON.parse(unit.text);
                    this.localSvr.yplayerConfig = {...config};
                }

                const lunits = await connect.manager.find(YBingParamEntry, {extra: 0});
                if (lunits.length === 0) {
                    const unit = new YBingParamEntry();
                    unit.extra = 0;
                    unit.text = JSON.stringify(this.localSvr.ybingConfig);
                    await connect.manager.save(unit);
                } else {
                    const unit = lunits[0];
                    let config: YBingConfig;
                    config = JSON.parse(unit.text);
                    this.localSvr.ybingConfig = {...config};
                }
                */
            }
        });
    }

    saveYPlayerConfig() {
        console.log('save player config setting');
        this.platform.ready().then(async () => {
            if (this.localSvr.isAndroid) {
                await this.localSvr.sqlService;
                const connect = getConnection();
                const runits = await connect.manager.find(YPlayerParamEntry, {extra: 0});
                if (runits.length === 0) {
                    const unit = new YPlayerParamEntry();
                    unit.extra = 0;
                    unit.text = JSON.stringify(this.localSvr.yplayerConfig);
                    await connect.manager.save(unit);
                } else {
                    const unit = runits[0];
                    unit.text = JSON.stringify(this.localSvr.yplayerConfig);
                    await connect.manager.save(unit);
                }
                const lunits = await connect.manager.find(YBingParamEntry, {extra: 0});
                if (lunits.length === 0) {
                    const unit = new YBingParamEntry();
                    unit.extra = 0;
                    unit.text = JSON.stringify(this.localSvr.ybingConfig);
                    await connect.manager.save(unit);
                } else {
                    const unit = lunits[0];
                    unit.text = JSON.stringify(this.localSvr.ybingConfig);
                    await connect.manager.save(unit);
                }
            }
        });
    }
}
