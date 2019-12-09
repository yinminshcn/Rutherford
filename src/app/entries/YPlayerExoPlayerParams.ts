import {AndroidExoPlayerParams} from '@ionic-native/android-exoplayer/ngx';
export interface YPlayerExoPlayerParams extends AndroidExoPlayerParams {
    title ?: string;
    description ?: string;
    cueHeight ?: number;
    movieType ?: number;
    subtitleDecodeMethod ?: number;
}
