/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package savant.net;

import java.io.File;

/**
 * Event which is sent by asynchronous downloads.
 *
 * @author tarkvara
 */
public class DownloadEvent {
    public enum Type {
        STARTED,
        COMPLETED,
        FAILED,
        PROGRESS
    }

    final Type type;
    final double progress;
    final File file;
    final Exception error;

    private DownloadEvent(Type type, double progress, File file, Exception error) {
        this.type = type;
        this.progress = progress;
        this.file = file;
        this.error = error;
    }

    /**
     * A download event indicating that the process has started.
     */
    DownloadEvent(Type type) {
        this(type, Double.NaN, null, null);
    }

    /**
     * A download event represent progress towards our goal.
     *
     * @param progress a value from 0.0 to 1.0 indicating the amount of progress completed
     */
    DownloadEvent(double progress) {
        this(Type.PROGRESS, progress, null, null);
    }

    /**
     * A download event representing successful completion of the download.
     *
     * @param file the destination file
     */
    DownloadEvent(File file) {
        this(Type.COMPLETED, Double.NaN, file, null);
    }

    /**
     * A download event indicating that the download has failed.
     *
     * @param file the destination file
     */
    DownloadEvent(Exception error) {
        this(Type.FAILED, Double.NaN, null, error);
    }

    public Type getType() {
        return type;
    }

    public double getProgress() {
        return progress;
    }

    public File getFile() {
        return file;
    }

    public Exception getError() {
        return error;
    }
}