package co.frontyard.cordova.plugin.exoplayer.extensions;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.text.Cue;
import com.google.android.exoplayer2.text.SimpleSubtitleDecoder;
import com.google.android.exoplayer2.text.SubtitleDecoder;
import com.google.android.exoplayer2.text.SubtitleDecoderException;
import com.google.android.exoplayer2.text.SubtitleInputBuffer;
import com.google.android.exoplayer2.text.SubtitleOutputBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class UserSubtitleDecoder<T extends SimpleSubtitleDecoder> implements SubtitleDecoder {
    static int decodeMethod = 0;
    int din_counter = 0;
    int dout_counter = 0;
    public T decoder;

    public static void setDecodeMethod(int method){
        decodeMethod = method;
    }

    public UserSubtitleDecoder(T decoder) {
        this.decoder = decoder;
    }

    @Override
    public final String getName() {
        return decoder.getName();
    }

    @Override
    public void setPositionUs(long timeUs) {
        decoder.setPositionUs(timeUs);
    }

    @Override
    public final SubtitleInputBuffer dequeueInputBuffer() throws SubtitleDecoderException {
        return decoder.dequeueInputBuffer();
    }

    @Override
    public final void queueInputBuffer(SubtitleInputBuffer inputBuffer) throws SubtitleDecoderException {
        decoder.queueInputBuffer(inputBuffer);
    }

    @Override
    public final SubtitleOutputBuffer dequeueOutputBuffer() throws SubtitleDecoderException {
        try {
            SubtitleOutputBuffer outputBuffer = decoder.dequeueOutputBuffer();
            if( (outputBuffer != null) && (outputBuffer.isEndOfStream() == false) ){
                if( outputBuffer.getEventTimeCount() > 0 ){
                    ArrayList<UserCue> cues ;
                    if( decodeMethod == 0 ) {
                        cues = mapCueOne2One(outputBuffer);
                    } else {
                        cues = mapCueMany2One(outputBuffer, 2000, 1000 * 1000);
                    }

                    UserSubtitle subtitle = new UserSubtitle(cues);
                    outputBuffer.setContent(0, subtitle, 0);
                }
            }
            return outputBuffer;
        } catch ( SubtitleDecoderException e ){
            throw e;
        }
    }

    public ArrayList<UserCue> mapCueOne2One(SubtitleOutputBuffer outputBuffer) {
        ArrayList<UserCue> cues = new ArrayList<>();
        for(int i = 0; i < outputBuffer.getEventTimeCount(); i++) {
            long etime = outputBuffer.getEventTime(i);
            List<Cue> eCues = outputBuffer.getCues(etime);
            CharSequence eText = null;
            for(int j = 0; j < eCues.size(); j++){
                Cue eCue = eCues.get(j);
                if( eCue == null ){
                    continue;
                }
                if (eText == null) {
                    eText = eCue.text;
                } else {
                    eText = eText.toString() + eCue.text.toString();
                }
            }
            if(eText == null){
                continue;
            }
            UserCue cue = new UserCue(eText);
            cue.startTime = etime;
            if( i == outputBuffer.getEventTimeCount() - 1 ){
                cue.endTime = C.TIME_END_OF_SOURCE;
            } else {
                cue.endTime = outputBuffer.getEventTime(i+1);
            }
            cues.add(cue);
        }
        return cues;
    }

    public ArrayList<UserCue> mapCueMany2One(SubtitleOutputBuffer outputBuffer, long margin, long window) {
        ArrayList<UserCue> eCues = mapCueOne2One(outputBuffer);
        ArrayList<UserCue> cues = new ArrayList<>();
        CharSequence eText = null;
        long tHead = 0;
        long tTail = 0;
        Pattern UpperCase = Pattern.compile("[A-Z]");
        Pattern LowerCase = Pattern.compile("[a-z]");
        for(int i = 0; i <= eCues.size(); i++){
            boolean isHead = false;
            /// end of array
            if( i == eCues.size() ){
                isHead = true;
            } else {
                Matcher UpperMatch = UpperCase.matcher(eCues.get(i).text);
                Matcher LowerMatch = LowerCase.matcher(eCues.get(i).text);
                /// the string begin with uppercase
                if( (UpperMatch != null) && (LowerMatch != null) ){
                    boolean hasUpper = UpperMatch.find();
                    boolean hasLower = LowerMatch.find();
                    if( (hasUpper == true) && (hasLower == false) ) {
                        isHead = true;
                    } else if( (hasUpper == true) && (hasLower == true) ){
                        if( UpperMatch.start() <= LowerMatch.start() ){
                            isHead = true;
                        }
                    }
                }
                /// the previous transaction is long ago
                if( eCues.get(i).startTime > tTail + window) {
                    isHead = true;
                }
            }
            /// no previous transaction
            if( eText == null ) {
                isHead = true;
            }
            if( isHead ) {
                /// store previous compressed cues
                if( eText != null ){
                    UserCue nextCue = new UserCue(eText);
                    nextCue.startTime = tHead;
                    nextCue.endTime   = tTail;
                    if( cues.size() > 0 ){
                        UserCue prevCue = cues.get(cues.size()-1);
                        if( nextCue.startTime > prevCue.endTime + 2 * margin ) {
                            nextCue.startTime = nextCue.startTime - margin;
                            prevCue.endTime   = prevCue.endTime   + margin;
                        } else {
                            long tMiddle = (nextCue.startTime + prevCue.endTime) / 2;
                            nextCue.startTime = tMiddle + 0;
                            prevCue.endTime   = tMiddle - 1;
                        }
                    } else {
                        nextCue.startTime = nextCue.startTime - margin;
                    }
                    cues.add(nextCue);
                    eText = null;
                }
                /// end of array, just break
                if( i == eCues.size() ){
                    break;
                }
                eText = eCues.get(i).text;
                tHead = eCues.get(i).startTime;
                tTail = eCues.get(i).endTime;
            } else {
                eText = eText.toString() + eCues.get(i).text.toString();
                tTail = eCues.get(i).endTime;
            }
        }
        return cues;
    }


    @Override
    public final void flush() {
        decoder.flush();
    }

    @Override
    public void release() {
        decoder.release();
    }

}

