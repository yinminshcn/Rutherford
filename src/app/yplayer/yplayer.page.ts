import {Component, OnInit} from '@angular/core';
import {AndroidExoplayer, AndroidExoplayerState} from '@ionic-native/android-exoplayer/ngx';
import {LocalhostService} from '../localhost.service';
import {Platform} from '@ionic/angular';
import {File, DirectoryEntry} from '@ionic-native/file/ngx';
import {Observable} from 'rxjs';
import {getConnection} from 'typeorm';
import {YPlayerParamEntry} from '../entries/YPlayerParamEntry';
import {YPlayerExoPlayerParams} from '../entries/YPlayerExoPlayerParams';

@Component({
    selector: 'app-yplayer',
    templateUrl: 'yplayer.page.html',
    styleUrls: ['yplayer.page.scss']
})
export class YplayerPage implements OnInit {
    position: number;
    history$: Observable<YPlayerExoPlayerParams[]>;
    medias$: Observable<YPlayerExoPlayerParams[]>;

    constructor(public player: AndroidExoplayer,
                public localSvr: LocalhostService,
                public plt: Platform,
                public file: File
    ) {
    }


    ngOnInit() {
        this.position = 0;
        this.setupHistory();
        this.setupMedia();
    }

    setupHistory() {
        this.history$ = new Observable<YPlayerExoPlayerParams[]>(
            observer => {
                this.plt.ready().then(
                    async () => {
                        let histories: YPlayerExoPlayerParams[];
                        histories = [];
                        // await this.localSvr.setupSQLite();
                        await this.localSvr.sqlService;
                        const connect = getConnection();
                        const runits = await connect.manager.find(YPlayerParamEntry, {extra: 1});
                        console.log(JSON.stringify(runits, null, 2));
                        const units = runits.sort((n1: YPlayerParamEntry, n2: YPlayerParamEntry) => {
                            return n2.createdDate.getTime() - n1.createdDate.getTime();
                        });
                        while (units.length > 3) {
                            const unit = units.pop();
                            await connect.manager.remove(unit);
                        }
                        // const units = await connect.manager.createQueryBuilder()
                        //     .select()
                        //     .from(YPlayerParamEntry, 'definition')
                        //     .where('definition.extra = :extra', {extra: 1})
                        //     .orderBy('definition.createdDate', 'DESC')
                        //     .take(5)
                        //     .getMany();
                        for (const unit of units) {
                            let info: YPlayerExoPlayerParams;
                            info = JSON.parse(unit.text);
                            histories.push(info);
                        }
                        observer.next(histories);
                    }
                );
            }
        );
    }


    setupMedia() {
        this.medias$ = new Observable<YPlayerExoPlayerParams[]>(
            observer => {
                this.plt.ready().then(
                    async () => {
                        const movies: YPlayerExoPlayerParams[] = [];
                        const obbpath = this.file.externalApplicationStorageDirectory;
                        const folders = await this.file.listDir(obbpath, 'movie');
                        for (const folder of folders) {
                            if (folder.isDirectory) {
                                const param: YPlayerExoPlayerParams = await this.readFolder(folder as DirectoryEntry);
                                movies.push(param);
                            }
                        }
                        movies.sort((f0, f1) => {
			    if( f0.url < f1.url ) {
			        return -1;
			    }
			    if( f0.url == f1.url ) {
			        return 0;
			    }
			    return 1;
                        });
                        observer.next(movies);
                    }
                );
            }
        );
    }

    playMediaByInfo(content: YPlayerExoPlayerParams) {
        content.cueHeight = this.localSvr.yplayerConfig.cueHeight;
        content.movieType = this.localSvr.yplayerConfig.movieType;
        content.subtitleDecodeMethod = this.localSvr.yplayerConfig.subtitleDecodeMethod;
        this.plt.ready().then(
            () => {
                this.player.show(content).subscribe(
                    (status: AndroidExoplayerState) => {
                        console.log('player status update');
                        // console.log(JSON.stringify(status, null, 2));
                        const eventType = 'eventType';
                        if (eventType in status) {
                            if (status[eventType] === 'POSITION_DISCONTINUITY_EVENT') {
                                const position = 'position';
                                this.position = Number(status[position]);
                            } else if (status[eventType] === 'STOP_EVENT') {
                                content.seekTo = this.position;
                                // content.title = media.title;
                                console.log(JSON.stringify(content, null, 2));
                                console.log(JSON.stringify(content));
                                this.plt.ready().then(
                                    async () => {
                                        // await this.localSvr.setupSQLite();
                                        await this.localSvr.sqlService;
                                        const connect = getConnection();
                                        const unit = new YPlayerParamEntry();
                                        unit.extra = 1;
                                        unit.text = JSON.stringify(content);
                                        await connect.manager.save(unit);
                                    }
                                );
                            }
                            if (status[eventType] === 'TRACK_MARK_EVENT') {
                                this.plt.ready().then(
                                    async () => {
                                        await this.localSvr.sqlService;
                                        const connect = getConnection();
                                        const unit = new YPlayerParamEntry();
                                        unit.extra = 2;
                                        unit.text = JSON.stringify(status);
                                        await connect.manager.save(unit);
                                    }
                                );
                                // this.localSvr.print(status);
                            }
                        }
                    },
                    (err) => {
                        console.log('player error happen');
                    },
                    () => {
                        console.log('player video done');
                    }
                );
            }
        );
    }

    readFolder(folder: DirectoryEntry) {
        return new Promise<YPlayerExoPlayerParams>(resolve => {
            const reader = folder.createReader();
            reader.readEntries((files) => {
                let params: YPlayerExoPlayerParams;
                params = {url: ''};
                for (const file of files) {
                    console.log(file.fullPath);
                    if (file.fullPath.match(/.*mp4$/)) {
                        params.url = file.toURL();
                        const regexp = /[^\/]*mp4/;
                        const rst = regexp.exec(file.fullPath);
                        params.title = rst[0];
                    }
                    if (file.fullPath.match(/.*mkv$/)) {
                        params.url = file.toURL();
                        const regexp = /[^\/]*mkv/;
                        const rst = regexp.exec(file.fullPath);
                        params.title = rst[0];
                    }
                    if (file.fullPath.match(/.*rmvb$/)) {
                        params.url = file.toURL();
                        const regexp = /[^\/]*rmvb/;
                        const rst = regexp.exec(file.fullPath);
                        params.title = rst[0];
                    }
                    if (file.fullPath.match(/.*vtt$/)) {
                        params.subtitleUrl = file.toURL();
                    }
                    if (file.fullPath.match(/.*srt$/)) {
                        params.subtitleUrl = file.toURL();
                    }
                }
                resolve(params);
            });
        });
    }

}
