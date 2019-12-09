package co.frontyard.cordova.plugin.exoplayer.extensions;

import android.text.Layout;

import com.google.android.exoplayer2.text.Cue;

public class UserCue extends Cue {
    public long startTime;
    public long endTime;

    public UserCue(CharSequence text) {
        this(0, 0, text);
    }

    public UserCue(long startTime, long endTime, CharSequence text) {
        this(startTime, endTime, text, null, Cue.DIMEN_UNSET, Cue.TYPE_UNSET, Cue.TYPE_UNSET,
                Cue.DIMEN_UNSET, Cue.TYPE_UNSET, Cue.DIMEN_UNSET);
    }

    public UserCue(long startTime, long endTime, CharSequence text, Layout.Alignment textAlignment,
                   float line, @Cue.LineType int lineType, @Cue.AnchorType int lineAnchor, float position,
                   @Cue.AnchorType int positionAnchor, float width) {
        super(text, textAlignment, line, lineType, lineAnchor, position, positionAnchor, width);
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
