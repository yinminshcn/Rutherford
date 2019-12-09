package co.frontyard.cordova.plugin.exoplayer.extensions;

import android.content.Context;
import android.os.Looper;

import com.google.android.exoplayer2.DefaultRenderersFactory;
import com.google.android.exoplayer2.Format;
import com.google.android.exoplayer2.Renderer;
import com.google.android.exoplayer2.text.SubtitleDecoder;
import com.google.android.exoplayer2.text.SubtitleDecoderFactory;
import com.google.android.exoplayer2.text.TextOutput;
import com.google.android.exoplayer2.text.TextRenderer;
import com.google.android.exoplayer2.text.dvb.DvbDecoder;
import com.google.android.exoplayer2.text.ssa.SsaDecoder;
import com.google.android.exoplayer2.text.subrip.SubripDecoder;
import com.google.android.exoplayer2.text.ttml.TtmlDecoder;
import com.google.android.exoplayer2.text.tx3g.Tx3gDecoder;
import com.google.android.exoplayer2.text.webvtt.Mp4WebvttDecoder;
import com.google.android.exoplayer2.text.webvtt.WebvttDecoder;
import com.google.android.exoplayer2.util.MimeTypes;

import java.util.ArrayList;

public class UserRenderersFactory extends DefaultRenderersFactory {
    public UserRenderersFactory(Context context) {
        super(context);
    }

    @Override
    protected void buildTextRenderers(Context context, TextOutput output, Looper outputLooper,
                                      @ExtensionRendererMode int extensionRendererMode,
                                      ArrayList<Renderer> out) {
        SubtitleDecoderFactory UserFactory = new SubtitleDecoderFactory() {
            @Override
            public boolean supportsFormat(Format format) {
                String mimeType = format.sampleMimeType;
                return MimeTypes.TEXT_VTT.equals(mimeType)
                        || MimeTypes.TEXT_SSA.equals(mimeType)
                        || MimeTypes.APPLICATION_TTML.equals(mimeType)
                        || MimeTypes.APPLICATION_MP4VTT.equals(mimeType)
                        || MimeTypes.APPLICATION_SUBRIP.equals(mimeType)
                        || MimeTypes.APPLICATION_TX3G.equals(mimeType)
                        || MimeTypes.APPLICATION_DVBSUBS.equals(mimeType);
            }
            @Override
            public SubtitleDecoder createDecoder(Format format) {
                switch (format.sampleMimeType) {
                    case MimeTypes.TEXT_VTT:
                        return new UserSubtitleDecoder<WebvttDecoder>(new WebvttDecoder());
                    case MimeTypes.TEXT_SSA:
                        return new UserSubtitleDecoder<SsaDecoder>(new SsaDecoder(format.initializationData));
                    case MimeTypes.APPLICATION_MP4VTT:
                        return new UserSubtitleDecoder<Mp4WebvttDecoder>(new Mp4WebvttDecoder());
                    case MimeTypes.APPLICATION_TTML:
                        return new UserSubtitleDecoder<TtmlDecoder>(new TtmlDecoder());
                    case MimeTypes.APPLICATION_SUBRIP:
                        return new UserSubtitleDecoder<SubripDecoder>(new SubripDecoder());
                    case MimeTypes.APPLICATION_TX3G:
                        return new UserSubtitleDecoder<Tx3gDecoder>(new Tx3gDecoder(format.initializationData));
                    case MimeTypes.APPLICATION_DVBSUBS:
                        return new UserSubtitleDecoder<DvbDecoder>(new DvbDecoder(format.initializationData));
                    default:
                        throw new IllegalArgumentException("Attempted to create decoder for unsupported format");
                }
            }
        };
        out.add(new TextRenderer(output, outputLooper, UserFactory));
    }
}
