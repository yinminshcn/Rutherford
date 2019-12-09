package co.frontyard.cordova.plugin.exoplayer.extensions;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.text.Cue;
import com.google.android.exoplayer2.text.Subtitle;
import com.google.android.exoplayer2.util.Assertions;
import com.google.android.exoplayer2.util.Util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class UserSubtitle implements Subtitle {

    private final List<UserCue> cues;
    private final int numCues;
    private final long[] cueTimesUs;
    private final long[] sortedCueTimesUs;

    static long offset = 0;

    /**
     * @param cues A list of the cues in this subtitle.
     */
    public UserSubtitle(List<UserCue> cues) {
        this.cues = cues;
        numCues = cues.size();
        cueTimesUs = new long[2 * numCues];
        for (int cueIndex = 0; cueIndex < numCues; cueIndex++) {
            UserCue cue = cues.get(cueIndex);
            int arrayIndex = cueIndex * 2;
            cueTimesUs[arrayIndex] = cue.startTime;
            cueTimesUs[arrayIndex + 1] = cue.endTime;
        }
        sortedCueTimesUs = Arrays.copyOf(cueTimesUs, cueTimesUs.length);
        Arrays.sort(sortedCueTimesUs);

    }

    public static void set_offset(long voffset){
        offset = voffset;
    }

    public static long get_offset(){
        return offset;
    }

    @Override
    public int getNextEventTimeIndex(long timeUs) {
        int index = Util.binarySearchCeil(sortedCueTimesUs, timeUs - offset, false, false);
        return index < sortedCueTimesUs.length ? index : C.INDEX_UNSET;
    }

    @Override
    public int getEventTimeCount() {
        return sortedCueTimesUs.length;
    }

    @Override
    public long getEventTime(int index) {
        Assertions.checkArgument(index >= 0);
        Assertions.checkArgument(index < sortedCueTimesUs.length);
        return sortedCueTimesUs[index] + offset;
    }

    @Override
    public List<Cue> getCues(long timeUs) {
        ArrayList<Cue> list = null;
        for (int i = 0; i < cues.size(); i++) {
            if ((cues.get(i).startTime <= timeUs - offset) && (timeUs - offset < cues.get(i).endTime)) {
                if (list == null) {
                    list = new ArrayList<>();
                }
                list.add(cues.get(i));
            }
        }
        if( list == null ) {
            return Collections.emptyList();
        } else {
            return list;
        }
    }

}
