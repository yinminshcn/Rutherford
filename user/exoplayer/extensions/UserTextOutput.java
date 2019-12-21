package co.frontyard.cordova.plugin.exoplayer.extensions;

import android.view.View;

import com.google.android.exoplayer2.text.Cue;
import com.google.android.exoplayer2.text.TextOutput;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class UserTextOutput implements TextOutput {
    /// see ExoPlayerImplInternal::RENDERER_TIMESTAMP_OFFSET_US
    /**
     * Offset added to all sample timestamps read by renderers to make them non-negative. This is
     * provided for convenience of sources that may return negative timestamps due to prerolling
     * samples from a keyframe before their first sample with timestamp zero, so it must be set to a
     * value greater than or equal to the maximum key-frame interval in seekable periods.
     */
    private static final int RENDERER_TIMESTAMP_OFFSET_US = 60000000;

    long               textOffsetUs;
    UserPlayer         player      ;
    ArrayList<UserCue> listQ       ;

    public UserTextOutput(UserPlayer player, long text_offset_Ms){
        this.player     = player;
        this.listQ      = new ArrayList<>();
        this.setTextOffset(text_offset_Ms);

        player.setNextClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                next();
            }
        });
    }

    public void setTextOffset(long text_offset_Ms){
        this.textOffsetUs = text_offset_Ms * 1000 - RENDERER_TIMESTAMP_OFFSET_US;
        UserSubtitle.set_offset(text_offset_Ms * 1000);
    }

    public long getTextOffsetMs(){
        return UserSubtitle.get_offset() / 1000;
    }

    @Override
    public void onCues(List<Cue> cues) {
        if( listQ.size() > 0 ){
            UserCue headCue = listQ.get(0);
            UserCue tailCue = listQ.get(listQ.size()-1);
            long current_position = player.getCurrentPosition();
            long middle_position = (headCue.startTime + tailCue.endTime + 2 * textOffsetUs) / 2000;
            if( current_position >= middle_position ) {
                pause((headCue.startTime + textOffsetUs) / 1000);
            }
            return;
        }
        if( (cues != null) && (cues.size() > 0) ){
            for(int i = 0; i < cues.size(); i++){
                UserCue cue = (UserCue)(cues.get(i));
                listQ.add(cue);
            }
        }
    }

    public void pause(long positionMs) {
        player.setPlayWhenReady(false);
        player.seek(positionMs);
    }

    public void next() {
        player.next();

        long positionMs = player.getCurrentPosition();
        if( listQ.size() > 0 ){
            UserCue tailCue = listQ.get(listQ.size()-1);
            positionMs = (tailCue.endTime + textOffsetUs) / 1000 + 1;
        }
        listQ.clear();
        player.seek(positionMs);
        player.setPlayWhenReady(true);
    }

    public JSONObject getState(){
        try {
            JSONObject obj = new JSONObject();
            obj.put("textOffsetUs", this.textOffsetUs);
            if( listQ.size() > 0 ){
                UserCue headCue = listQ.get(0);
                UserCue tailCue = listQ.get(listQ.size()-1);
                obj.put("eHead", headCue.startTime);
                obj.put("eTail", tailCue.endTime);
                String eText = "";
                for(int i = 0; i < listQ.size(); i++){
                    eText = eText + listQ.get(i).text.toString();
                }
                obj.put("eText", eText);
            }
            return obj;
        } catch ( JSONException e ) {
        }
        return null;
    }

}
