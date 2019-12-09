package co.frontyard.cordova.plugin.exoplayer.extensions;

import android.view.View;


public interface UserPlayer {
    public void setNextClickListener(View.OnClickListener listener);

    public void setPrevClickListener(View.OnClickListener listener);

    public void setPlayWhenReady(boolean playWhenReady);

    public void seek(long positionMs);

    public long getCurrentPosition();

    public void onPlayerStateChanged(boolean playWhenReady, int playbackState);

    public View findViewByName(String name);

    public void next();

    public void close();
}
