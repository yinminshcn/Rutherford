import {Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Platform} from '@ionic/angular';
import {getConnection} from 'typeorm';
import {
    SwiperComponent,
    SwiperConfigInterface,
    SwiperVirtualInterface,
    SwiperPaginationInterface
} from 'ngx-swiper-wrapper';

import {LocalhostService} from '../localhost.service';

import {ybing_worditem} from '../entries/ybing_worditem';
import {ybing_imageproperty} from '../entries/ybing_imageproperty';
import {ybing_pronounceproperty} from '../entries/ybing_pronounceproperty';
import {ybing_sentenceproperty} from '../entries/ybing_sentenceproperty';
import {ybing_definitionproperty} from '../entries/ybing_definitionproperty';
import {SwiperRenderParam} from '../entries/SwiperRenderParam';

@Component({
    selector: 'app-ybing',
    templateUrl: 'ybing.page.html',
    styleUrls: ['ybing.page.scss'],
})
export class YbingPage implements OnInit, AfterViewInit {
    @ViewChild(SwiperComponent) componentRef?: SwiperComponent;
    slides$: Observable<SwiperRenderParam>;
    sliderConfig$: Observable<SwiperConfigInterface>;
    lockSwiper: boolean;
    hideEnglish: number;
    hideChinse: number;

    public words: ybing_worditem[];

    constructor(
        public localSvr: LocalhostService,
        public platform: Platform,
        public cdRef: ChangeDetectorRef
    ) {
        this.slides$ = this.localSvr.model.data$;
        const self = this;
        this.sliderConfig$ = new Observable<SwiperConfigInterface>(observer => {
                this.platform.ready().then(async () => {
                        const sliderConfig: SwiperConfigInterface = {};
                        const paginationConfig: SwiperPaginationInterface = {};
                        paginationConfig.el = '.swiper-pagination';
                        paginationConfig.type = 'fraction';
                        sliderConfig.pagination = paginationConfig;
                        if (self.localSvr.isAndroid) {
                            await self.localSvr.sqlService;
                            const connect = getConnection();
                            const w = await connect.manager.find(ybing_worditem);
                            self.localSvr.shuffle(w);
                            for (const word of w) {
                                word.pronounces = [];
                                word.sentences = [];
                                word.definitions = [];
                                word.images = [];
                            }
                            self.words = w;
                            const sliderVirtualConfig: SwiperVirtualInterface = {};
                            sliderVirtualConfig.cache = false;
                            sliderVirtualConfig.addSlidesAfter = 1;
                            sliderVirtualConfig.addSlidesBefore = 1;
                            sliderVirtualConfig.slides = self.words;
                            sliderVirtualConfig.renderExternal = (data: SwiperRenderParam) => {
                                console.log('=============renderExternal==============');
                                self.cdRef.detach();
                                self.platform.ready().then(async () => {
                                    await self.loadWords(data);
                                    self.localSvr.model.set(data);
                                    self.cdRef.detectChanges();
                                });
                            };
                            sliderConfig.virtual = sliderVirtualConfig;
                            observer.next(sliderConfig);
                        } else {
                            observer.next(sliderConfig);
                        }
                    }
                );
            }
        );
        this.setupStateVariable();
        this.localSvr.state.data$.subscribe((dat) => {
            this.setupStateVariable();
        });
    }

    ngOnInit() {
        console.log('ngOnInit');
        // console.log(this.words.length);
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit');
        // console.log(this.cards.length);
    }

    async loadWords(data: SwiperRenderParam) {
        await this.localSvr.sqlService;
        const connect = getConnection();
        for (let id = 0; id < this.words.length; id++) {
            if ((id > data.to) || (id < data.from)) {
                this.words[id].sentences = [];
                this.words[id].definitions = [];
                this.words[id].pronounces = [];
                this.words[id].images = [];
            } else {
                if ((this.words[id].imageIds.length > 0) && (this.words[id].images.length === 0)) {
                    this.localSvr.shuffle(this.words[id].imageIds);
                    const images = await connect.manager.findByIds(ybing_imageproperty, [this.words[id].imageIds[0]]);
                    for (const image of images) {
                        this.words[id].images.push(image);
                    }
                }
                if ((this.words[id].pronounceIds.length > 0) && (this.words[id].pronounces.length === 0)) {
                    const pronounces = await connect.manager.findByIds(ybing_pronounceproperty, this.words[id].pronounceIds);
                    for (const pronounce of pronounces) {
                        this.words[id].pronounces.push(pronounce);
                    }
                }
                if ((this.words[id].sentenceIds.length > 0) && (this.words[id].sentences.length === 0)) {
                    this.localSvr.shuffle(this.words[id].sentenceIds);
                    const sentences = await connect.manager.findByIds(ybing_sentenceproperty, [this.words[id].sentenceIds[0]]);
                    for (const sentence of sentences) {
                        this.words[id].sentences.push(sentence);
                    }
                }
                if ((this.words[id].definitionIds.length > 0) && (this.words[id].definitions.length === 0)) {
                    const definitions = await connect.manager.findByIds(ybing_definitionproperty, this.words[id].definitionIds);
                    for (const definition of definitions) {
                        this.words[id].definitions.push(definition);
                    }
                }

            }
        }
    }

    getImageSrc(img: ybing_imageproperty) {
        let image = 'data:';
        image = image + img.mime;
        image = image + ';charset=utf-8;base64,';
        image = image + img.image;
        return image;
    }

    slideDoubleTap() {
        if (this.localSvr.ybingConfig.hide_english_or_chinese != 0) {
            this.localSvr.updateState(1, 1);
            this.platform.ready().then(async () => {
                this.cdRef.detectChanges();
            });
            setTimeout(() => {
                this.localSvr.updateState(1, 0);
                this.platform.ready().then(async () => {
                    this.cdRef.detectChanges();
                });
            }, 1000 * this.localSvr.ybingConfig.timeoutCnt);
        }
    }

    setupStateVariable() {
        if (this.localSvr.ybingConfig.hide_english_or_chinese != 2) {
            this.hideEnglish = 1.0;
        } else {
            if (this.localSvr.stateActive(1) === true) {
                this.hideEnglish = 1.0;
            } else {
                this.hideEnglish = 0.00001;
            }
        }
        if (this.localSvr.ybingConfig.hide_english_or_chinese != 1) {
            this.hideChinse = 1.0;
        } else {
            if (this.localSvr.stateActive(1) === true) {
                this.hideChinse = 1.0;
            } else {
                this.hideChinse = 0.00001;
            }
        }
        if (this.localSvr.state.get() !== 0) {
            this.lockSwiper = true;
        } else {
            this.lockSwiper = false;
        }
        if (this.componentRef && this.componentRef.directiveRef) {
            const swiper = this.componentRef.directiveRef.swiper();
            if (swiper) {
                swiper.allowSlideNext = !this.lockSwiper;
                swiper.allowSlidePrev = !this.lockSwiper;
                swiper.allowTouchMove = !this.lockSwiper;
            }
            // this.componentRef.directiveRef.update();
        }
        console.log('=================');
        console.log(this.localSvr.state.get());
        console.log(this.hideChinse);
        console.log(this.hideEnglish);
    }

    onIndexChange(index: number) {
        if (this.localSvr.ybingConfig.auto_play) {
            if (this.words.length > index) {
                if (this.words[index].pronounces.length > 0) {
                    this.localSvr.playPronouce(this.words[index].pronounces[0]);
                }
            }
        }
    }

}
