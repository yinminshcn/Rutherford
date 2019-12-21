/*
 The MIT License (MIT)

 Copyright (c) 2017 Nedim Cholich

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
package co.frontyard.cordova.plugin.exoplayer;

import android.app.*;
import android.content.*;
import android.media.*;
import android.net.*;
import android.util.*;
import android.view.*;
import android.widget.*;

import com.google.android.exoplayer2.*;
import com.google.android.exoplayer2.source.*;
import com.google.android.exoplayer2.trackselection.*;
import com.google.android.exoplayer2.ui.*;
import com.google.android.exoplayer2.upstream.*;
import com.google.android.exoplayer2.util.*;

import android.content.pm.ActivityInfo;
import java.lang.*;
import java.lang.Math;
import java.lang.Override;

import co.frontyard.cordova.plugin.exoplayer.extensions.UserPlayer;
import co.frontyard.cordova.plugin.exoplayer.extensions.UserRenderersFactory;
import co.frontyard.cordova.plugin.exoplayer.extensions.UserSubtitleDecoder;
import co.frontyard.cordova.plugin.exoplayer.extensions.UserTextOutput;

import org.apache.cordova.*;
import org.json.*;

import com.rutherford.ybing.R;

import android.widget.ImageButton;
import android.widget.Switch;

public class Player implements UserPlayer {
    public static final String TAG = "ExoPlayerPlugin";
    private final Activity activity;
    private final CallbackContext callbackContext;
    private final Configuration config;
    private Dialog dialog;
    private SimpleExoPlayer exoPlayer;
    private SimpleExoPlayerView exoView;
    private CordovaWebView webView;
    private int controllerVisibility;
    private boolean paused = false;
    private AudioManager audioManager;

    UserTextOutput trackEvent;
    ImageButton prevBtn;
    ImageButton nextBtn;
    Button showBtn;
    ImageButton markBtn;
    ImageButton offsetIncrBtn;
    ImageButton offsetDecrBtn;
    Switch subtitleSwitch;

    boolean isMarked;
    boolean isVisible;

    public Player(Configuration config, Activity activity, CallbackContext callbackContext, CordovaWebView webView) {
        this.config = config;
        this.activity = activity;
        this.callbackContext = callbackContext;
        this.webView = webView;
        this.audioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
    }

    private ExoPlayer.EventListener playerEventListener = new ExoPlayer.EventListener() {
        @Override
        public void onLoadingChanged(boolean isLoading) {
            JSONObject payload = Payload.loadingEvent(Player.this.exoPlayer, isLoading);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onPlaybackParametersChanged(PlaybackParameters playbackParameters) {
            Log.i(TAG, "Playback parameters changed");
        }

        @Override
        public void onPlayerError(ExoPlaybackException error) {
            JSONObject payload = Payload.playerErrorEvent(Player.this.exoPlayer, error, null);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.ERROR, payload, true);
        }

        @Override
        public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
            if (config.getShowBuffering()) {
                LayoutProvider.setBufferingVisibility(exoView, activity, playbackState == ExoPlayer.STATE_BUFFERING);
            }
            Player.this.onPlayerStateChanged(playWhenReady, playbackState);
            JSONObject payload = Payload.stateEvent(Player.this.exoPlayer, playbackState, Player.this.controllerVisibility == View.VISIBLE);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onPositionDiscontinuity(int reason) {
            JSONObject payload = Payload.positionDiscontinuityEvent(Player.this.exoPlayer, reason);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onRepeatModeChanged(int newRepeatMode) {
            // Need to see if we want to send this to Cordova.
        }

        @Override
        public void onSeekProcessed() {
        }

        @Override
        public void onShuffleModeEnabledChanged(boolean shuffleModeEnabled) {
        }

        @Override
        public void onTimelineChanged(Timeline timeline, Object manifest) {
            JSONObject payload = Payload.timelineChangedEvent(Player.this.exoPlayer, timeline, manifest);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }

        @Override
        public void onTracksChanged(TrackGroupArray trackGroups, TrackSelectionArray trackSelections) {
            // Need to see if we want to send this to Cordova.
        }
    };

    private DialogInterface.OnDismissListener dismissListener = new DialogInterface.OnDismissListener() {
        @Override
        public void onDismiss(DialogInterface dialog) {
            if (exoPlayer != null) {
                exoPlayer.release();
            }
            exoPlayer = null;
            JSONObject payload = Payload.stopEvent(exoPlayer);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        }
    };

    private DialogInterface.OnKeyListener onKeyListener = new DialogInterface.OnKeyListener() {
        @Override
        public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
            int action = event.getAction();
            String key = KeyEvent.keyCodeToString(event.getKeyCode());
            // We need android to handle these key events
            if (key.equals("KEYCODE_VOLUME_UP") ||
                    key.equals("KEYCODE_VOLUME_DOWN") ||
                    key.equals("KEYCODE_VOLUME_MUTE")) {
                return false;
            } else {
                JSONObject payload = Payload.keyEvent(event);
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
                return true;
            }
        }
    };

    private View.OnTouchListener onTouchListener = new View.OnTouchListener() {
        int previousAction = -1;

        @Override
        public boolean onTouch(View v, MotionEvent event) {
            int eventAction = event.getAction();
            if (previousAction != eventAction) {
                previousAction = eventAction;
                JSONObject payload = Payload.touchEvent(event);
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            }
            return true;
        }
    };

    private PlaybackControlView.VisibilityListener playbackControlVisibilityListener = new PlaybackControlView.VisibilityListener() {
        @Override
        public void onVisibilityChange(int visibility) {
            Player.this.controllerVisibility = visibility;
        }
    };

    private AudioManager.OnAudioFocusChangeListener audioFocusChangeListener = new AudioManager.OnAudioFocusChangeListener() {
        public void onAudioFocusChange(int focusChange) {
            if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                JSONObject payload = Payload.audioFocusEvent(Player.this.exoPlayer, "AUDIOFOCUS_LOSS_TRANSIENT");
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
                JSONObject payload = Payload.audioFocusEvent(Player.this.exoPlayer, "AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK");
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                JSONObject payload = Payload.audioFocusEvent(Player.this.exoPlayer, "AUDIOFOCUS_GAIN");
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
                JSONObject payload = Payload.audioFocusEvent(Player.this.exoPlayer, "AUDIOFOCUS_LOSS");
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            }
        }
    };

    public void createPlayer() {
        createDialog();
        activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        preparePlayer(config.getUri());
    }

    public void createDialog() {
        dialog = new Dialog(this.activity, android.R.style.Theme_Black_NoTitleBar_Fullscreen);
        dialog.setOnKeyListener(onKeyListener);
        dialog.getWindow().getAttributes().windowAnimations = android.R.style.Animation_Dialog;
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View decorView = dialog.getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        decorView.setSystemUiVisibility(uiOptions);
        dialog.setCancelable(true);
        dialog.setOnDismissListener(dismissListener);

        FrameLayout mainLayout = LayoutProvider.getMainLayout(this.activity);
        exoView = LayoutProvider.getExoPlayerView(this.activity, config);
        exoView.setControllerVisibilityListener(playbackControlVisibilityListener);

        mainLayout.addView(exoView);
        dialog.setContentView(mainLayout);
        dialog.show();

        dialog.getWindow().setAttributes(LayoutProvider.getDialogLayoutParams(activity, config, dialog));
        exoView.requestFocus();
        exoView.setOnTouchListener(onTouchListener);
        LayoutProvider.setupController(exoView, activity, config.getController());

        /// TODO
        prevBtn = exoView.findViewById(R.id.prevBtn);
        nextBtn = exoView.findViewById(R.id.nextBtn);
        showBtn = exoView.findViewById(R.id.showBtn);
        markBtn = exoView.findViewById(R.id.markBtn);
        subtitleSwitch = exoView.findViewById(R.id.subtitleSwitch);
        offsetIncrBtn = exoView.findViewById(R.id.offsetIncr);
        offsetDecrBtn = exoView.findViewById(R.id.offsetDecr);
        exoView.findViewById(R.id.exo_buffering).setVisibility(View.GONE);
        ViewGroup.LayoutParams params = showBtn.getLayoutParams();
        params.height = config.getCueHeight();
        showBtn.setLayoutParams(params);
        changeMarkBtn(-1);
    }

    private int setupAudio() {
        activity.setVolumeControlStream(AudioManager.STREAM_MUSIC);
        return audioManager.requestAudioFocus(audioFocusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
    }

    private void preparePlayer(Uri uri) {
        int audioFocusResult = setupAudio();
        String audioFocusString = audioFocusResult == AudioManager.AUDIOFOCUS_REQUEST_FAILED ?
                "AUDIOFOCUS_REQUEST_FAILED" :
                "AUDIOFOCUS_REQUEST_GRANTED";

        TrackSelector trackSelector = new DefaultTrackSelector();
        LoadControl loadControl = new DefaultLoadControl();

        UserSubtitleDecoder.setDecodeMethod(config.getDecodeMethod());
        UserRenderersFactory renderersFactory = new UserRenderersFactory(this.activity.getApplicationContext());
        exoPlayer = ExoPlayerFactory.newSimpleInstance(renderersFactory, trackSelector, loadControl);
        exoPlayer.addListener(playerEventListener);

        if (null != exoView) {
            exoView.setPlayer(exoPlayer);
            setUserControlerVisible();
        }

        MediaSource mediaSource = getMediaSource(uri);
        if (mediaSource != null) {
            long offset = config.getSeekTo();
            boolean autoPlay = config.autoPlay();
            if (offset > -1) {
                exoPlayer.seekTo(offset);
            }
            exoPlayer.prepare(mediaSource);
            setupEventListerner();

            exoPlayer.setPlayWhenReady(autoPlay);
            paused = !autoPlay;

            JSONObject payload = Payload.startEvent(exoPlayer, audioFocusString);
            new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
        } else {
            sendError("Failed to construct mediaSource for " + uri);
        }
    }


    private MediaSource getMediaSource(Uri uri) {
        String userAgent = Util.getUserAgent(this.activity, config.getUserAgent());
        DataSource.Factory dataSourceFactory = new DefaultDataSourceFactory(this.activity.getApplicationContext(), userAgent);
        MediaSource mediaSource = new ExtractorMediaSource.Factory(dataSourceFactory).createMediaSource(uri);

        MediaSource eSource;
        Uri subtitleUri = config.getSubtitleUrl();
        if (null != subtitleUri) {
            String subtitleType = inferSubtitleType(subtitleUri);
            Log.i(TAG, "Subtitle present: " + subtitleUri + ", type=" + subtitleType);
            com.google.android.exoplayer2.Format textFormat = com.google.android.exoplayer2.Format.createTextSampleFormat(null, subtitleType, null, com.google.android.exoplayer2.Format.NO_VALUE, com.google.android.exoplayer2.Format.NO_VALUE, "en", null, 0);
            MediaSource subtitleSource = new SingleSampleMediaSource(subtitleUri, dataSourceFactory, textFormat, C.TIME_UNSET);
            eSource = new MergingMediaSource(mediaSource, subtitleSource);
        } else {
            eSource = mediaSource;
        }

        return eSource;
    }

    private static String inferSubtitleType(Uri uri) {
        String fileName = uri.getPath().toLowerCase();

        if (fileName.endsWith(".vtt")) {
            return MimeTypes.TEXT_VTT;
        } else {
            // Assume it's srt.
            return MimeTypes.APPLICATION_SUBRIP;
        }
    }

    public void setStream(Uri uri, JSONObject controller) {
        if (null != uri) {
            MediaSource mediaSource = getMediaSource(uri);
            exoPlayer.prepare(mediaSource);
            play();
        }
        setController(controller);
    }

    public void playPause() {
        if (this.paused) {
            play();
        } else {
            pause();
        }
    }

    private void pause() {
        paused = true;
        exoPlayer.setPlayWhenReady(false);
    }

    private void play() {
        paused = false;
        exoPlayer.setPlayWhenReady(true);
    }

    public void stop() {
        paused = false;
        exoPlayer.stop();
    }

    private long normalizeOffset(long newTime) {
        long duration = exoPlayer.getDuration();
        return duration == 0 ? 0 : Math.min(Math.max(0, newTime), duration);
    }

    public JSONObject seekTo(long timeMillis) {
        long newTime = normalizeOffset(timeMillis);
        exoPlayer.seekTo(newTime);
        JSONObject payload = Payload.seekEvent(Player.this.exoPlayer, newTime);
        return payload;
    }

    public JSONObject seekBy(long timeMillis) {
        long newTime = normalizeOffset(exoPlayer.getCurrentPosition() + timeMillis);
        exoPlayer.seekTo(newTime);
        JSONObject payload = Payload.seekEvent(Player.this.exoPlayer, newTime);
        return payload;
    }

    public JSONObject getPlayerState() {
        return Payload.stateEvent(exoPlayer,
                null != exoPlayer ? exoPlayer.getPlaybackState() : SimpleExoPlayer.STATE_ENDED,
                Player.this.controllerVisibility == View.VISIBLE);
    }

    public void showController() {
        if (null != exoView) {
            exoView.showController();
        }
    }

    public void hideController() {
        if (null != exoView) {
            exoView.hideController();
        }
    }

    public void setController(JSONObject controller) {
        if (null != exoView) {
            LayoutProvider.setupController(exoView, activity, controller);
        }
    }

    private void sendError(String msg) {
        Log.e(TAG, msg);
        JSONObject payload = Payload.playerErrorEvent(Player.this.exoPlayer, null, msg);
        new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.ERROR, payload, true);
    }

    @Override
    public void setPrevClickListener(View.OnClickListener listener) {
        prevBtn.setOnClickListener(listener);
    }

    @Override
    public void setNextClickListener(View.OnClickListener listener) {
        nextBtn.setOnClickListener(listener);
    }

    // 开关播放器
    @Override
    public void setPlayWhenReady(boolean playWhenReady) {
        exoPlayer.setPlayWhenReady(playWhenReady);
    }

    // 播放器定位操作
    @Override
    public void seek(long positionMs) {
        exoPlayer.seekTo(positionMs);
    }

    // 下一曲动作
    @Override
    public void next() {
        if (isMarked) {
            JSONObject state = trackEvent.getState();
            JSONObject payload = Payload.trackMarkEvent(config.getConfig(), state);
            if (payload != null) {
                new CallbackResponse(Player.this.callbackContext).send(PluginResult.Status.OK, payload, true);
            }
        }
        changeMarkBtn(-1);
        hideSubtitle();
    }

    // 播放器当前时间
    @Override
    public long getCurrentPosition() {
        return exoPlayer.getCurrentPosition();
    }

    @Override
    public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
        if (playWhenReady) {
            if (prevBtn != null) {
                prevBtn.setVisibility(View.INVISIBLE);
            }
            if (nextBtn != null) {
                nextBtn.setVisibility(View.INVISIBLE);
            }
        } else {
            if (prevBtn != null) {
                prevBtn.setVisibility(View.VISIBLE);
            }
            if (nextBtn != null) {
                nextBtn.setVisibility(View.VISIBLE);
            }
        }
        if( playbackState == ExoPlayer.STATE_ENDED ) {
            showController();
        }
    }

    @Override
    public View findViewByName(String name) {
        int id = activity.getResources().getIdentifier(name, "id", activity.getApplicationContext().getPackageName());
        return exoView.findViewById(id);
    }

    // 关闭播放器
    @Override
    public void close() {
        // exoPlayer.setTextOutput(null);
        if( trackEvent != null ) exoPlayer.removeTextOutput(trackEvent);
        activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        audioManager.abandonAudioFocus(audioFocusChangeListener);
        if (exoPlayer != null) {
            exoPlayer.release();
            exoPlayer = null;
        }
        trackEvent = null;
        if (this.dialog != null) {
            dialog.dismiss();
        }
    }

    // 设置监听动作
    public void setupEventListerner() {
        trackEvent = new UserTextOutput(this, 0);
        exoPlayer.addTextOutput(trackEvent);
        setPrevClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                close();
            }
        });
        showBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showSubtitle();
            }
        });
        markBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                changeMarkBtn();
            }
        });
        offsetIncrBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                long offsetMs = trackEvent.getTextOffsetMs();
                offsetMs += 50;
                changeOffset(offsetMs);
            }
        });
        offsetDecrBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                long offsetMs = trackEvent.getTextOffsetMs();
                offsetMs -= 50;
                changeOffset(offsetMs);
            }
        });
        subtitleSwitch.setOnCheckedChangeListener(
                new CompoundButton.OnCheckedChangeListener() {
                    public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                        Player.this.isVisible = isChecked;
                        setUserControlerVisible();
                    }
                }
        );

    }

    public void setUserControlerVisible(){
        exoView.getSubtitleView().setVisibility(isVisible ? View.VISIBLE : View.INVISIBLE);
        // exoView.setControllerShowTimeoutMs(isVisible ? PlaybackControlView.DEFAULT_SHOW_TIMEOUT_MS : 0);
        exoView.setControllerShowTimeoutMs(0);
    }

    // 设置书签
    public void changeMarkBtn(Integer... marks) {
        Integer mark = marks.length > 0 ? marks[0] : 0;
        if (mark > 0) {
            isMarked = true;
        } else if (mark < 0) {
            isMarked = false;
        } else {
            isMarked = !isMarked;
        }
        if (isMarked) {
            // set mark
            markBtn.setImageResource(R.drawable.btn_star_big_on);
        } else {
            // clear mark
            markBtn.setImageResource(R.drawable.btn_star_big_off);
        }
    }

    // 改变字幕的偏移量
    public void changeOffset(long offsetMs) {
        TextView label = exoView.findViewById(R.id.subtitleOffset);
        label.setText(offsetMs + "ms");
        trackEvent.setTextOffset(offsetMs);
    }

    // 隐藏字幕遮板时动作
    public void showSubtitle() {
        showBtn.setVisibility(View.GONE);
        exoView.getSubtitleView().setVisibility(isVisible ? View.VISIBLE : View.INVISIBLE);
    }

    // 显示字幕遮板时动作
    public void hideSubtitle() {
        showBtn.setVisibility(View.VISIBLE);
        exoView.getSubtitleView().setVisibility(View.INVISIBLE);
    }
}
