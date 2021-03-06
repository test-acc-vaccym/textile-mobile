package com.textile.textilenode;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.support.v7.widget.AppCompatImageView;
import android.util.Base64;

import com.facebook.react.uimanager.ThemedReactContext;

/**
 * TextileImageView is a top-level node for TextileImage. It can display images
 * from a Textile node by specifying a source hash path.
 */
class TextileImageView extends AppCompatImageView {

    private ThemedReactContext context;
    private String hashPath;
    private ScaleType xscaleType;

    public TextileImageView(ThemedReactContext context) {
        super(context);
        this.context = context;
    }

    public void setHashPath(String hashPath) {
        this.hashPath = hashPath;
    }

    public void xsetScaleType(ScaleType scaleType) {
        this.xscaleType = scaleType;
    }

    public void render() {
        try {
            String base64String = TextileNode.textile.getFileBase64(hashPath);
            byte[] decodedString = Base64.decode(base64String, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            setImageBitmap(bitmap);
            setScaleType(xscaleType);
        } catch (Exception e) {

        }
    }
}

