import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {Observable} from 'rxjs';
import {createConnection, getConnection} from 'typeorm';
import {Model, ModelFactory} from '@angular-extensions/model';
import {Media, MediaObject} from '@ionic-native/media/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

import {ybing_worditem} from './entries/ybing_worditem';
import {ybing_sentenceproperty} from './entries/ybing_sentenceproperty';
import {ybing_definitionproperty} from './entries/ybing_definitionproperty';
import {ybing_pronounceproperty} from './entries/ybing_pronounceproperty';
import {ybing_imageproperty} from './entries/ybing_imageproperty';
import {YPlayerParamEntry} from './entries/YPlayerParamEntry';
import {YPlayerConfig} from './entries/YPlayerConfig';
import {SwiperRenderParam} from './entries/SwiperRenderParam';
import {YBingConfig} from './entries/YBingConfig';
import {YBingParamEntry} from './entries/YBingParamEntry';

const defaultSlides: SwiperRenderParam = {
    offset: 0,
    slides: [],
    from: 0,
    to: 0
};

@Injectable({
    providedIn: 'root'
})
export class LocalhostService {
    yplayerConfig: YPlayerConfig;
    ybingConfig: YBingConfig;
    sqlService: Promise<boolean>;
    permService: Promise<boolean>;
    public model: Model<SwiperRenderParam>;
    public state: Model<number>;

    constructor(
        public platform: Platform,
        public media: Media,
        public androidPermissions: AndroidPermissions,
        public modelFactory: ModelFactory<SwiperRenderParam>,
        public stateFactory: ModelFactory<number>
    ) {
        this.prepareYPlayer();
        this.prepareYbing();
        this.preparePermission();
        this.prepareSQLite();
        this.prepareModel();
        this.prepareState();
    }

    get isAndroid(): boolean {
        return this.platform.is('android');
    }
    prepareYPlayer() {
        this.yplayerConfig = {};
        this.yplayerConfig.subtitleDecodeMethod = 0;
        this.yplayerConfig.cueHeight = 100;
        this.yplayerConfig.movieType = 0;
    }

    prepareYbing() {
        this.ybingConfig = {};
        this.ybingConfig.auto_play = true;
        this.ybingConfig.hide_english_or_chinese = 0;
        this.ybingConfig.timeoutCnt = 1;
    }

    preparePermission() {
        this.permService = new Promise<boolean>(mresolve => {
            this.platform.ready().then(async () => {
                if (this.isAndroid) {
                    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                        (result) => {
                            if ( result.hasPermission ) {
                                mresolve(true);
                            } else {
                                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                                    (rst) => {
                                        mresolve(true);
                                    }
                                );
                            }
                        }
                    );
                }
            });
        });
    }

    prepareSQLite() {
        this.sqlService = new Promise<boolean>(resolve => {
            this.platform.ready().then(async () => {
                if (this.isAndroid) {
                    await this.permService;
                    console.log('open sqlite3 datebase');
                    const connection = await createConnection({
                        type: 'cordova',
                        database: 'db.sqlite3',
                        location: 'default',
                        synchronize: true,
                        entities: [
                            ybing_worditem,
                            ybing_pronounceproperty,
                            ybing_definitionproperty,
                            ybing_imageproperty,
                            ybing_sentenceproperty,
                            YPlayerParamEntry,
                            YBingParamEntry
                        ]
                    });

                    await this.loadConfig();
                }
                resolve(true);
            });
        });
    }

    prepareModel() {
        this.model = this.modelFactory.create(defaultSlides);
    }

    prepareState() {
        this.state = this.stateFactory.create(0);
    }

    async loadConfig() {
        const connect = getConnection();
        console.log('get sqlite connection');
        const runits = await connect.manager.find(YPlayerParamEntry, {extra: 0});
        if (runits.length === 0) {
            const unit = new YPlayerParamEntry();
            unit.extra = 0;
            unit.text = JSON.stringify(this.yplayerConfig);
            await connect.manager.save(unit);
        } else {
            const unit = runits[0];
            let config: YPlayerConfig;
            config = JSON.parse(unit.text);
            this.yplayerConfig = {...config};
        }

        const lunits = await connect.manager.find(YBingParamEntry, {extra: 0});
        if (lunits.length === 0) {
            const unit = new YBingParamEntry();
            unit.extra = 0;
            unit.text = JSON.stringify(this.ybingConfig);
            await connect.manager.save(unit);
        } else {
            const unit = lunits[0];
            let config: YBingConfig;
            config = JSON.parse(unit.text);
            this.ybingConfig = {...config};
        }
    }

    shuffle(array) {
        let j, x, i;
        for (i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = array[i];
            array[i] = array[j];
            array[j] = x;
        }
        return array;
    }

    playMedia(mime: string, data: string) {
        if (this.stateActive(0)) {
            console.log('media already playing. No operation');
            return;
        }
        this.updateState(0, 1);
        let audio = 'data:';
        audio = audio + mime;
        audio = audio + ';charset=utf-8;base64,';
        audio = audio + data;
        const file: MediaObject = this.media.create(audio);
        const self = this;
        file.onStatusUpdate.subscribe(async (status) => {
            if (status === 4) {
                file.release();
                self.updateState(0, 0);
            }
        });
        file.play();
    }

    playPronouce(pron: ybing_pronounceproperty) {
        this.playMedia(pron.mime, pron.voice);
    }

    playSentence(sen: ybing_sentenceproperty) {
        this.playMedia(sen.mime, sen.engVoice);
    }

    updateState(type: number, raise: number) {
        let value = this.state.get();
        if (raise > 0) {
            value = value | (1 << type);
        } else {
            value = value & (~(1 << type));
        }
        this.state.set(value);
    }

    stateActive(type: number) {
        const value = this.state.get();
        if ((value & (1 << type)) > 0) {
            return true;
        }
        return false;
    }

    print(item) {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };
        console.log(JSON.stringify(item, getCircularReplacer(), 2));
    }
}
