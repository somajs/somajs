/*
 *    Copyright 2010-2011 University of Toronto
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
package savant.net;

import java.awt.EventQueue;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

import savant.controller.Listener;

/**
 *
 * @author mfiume
 */
public class DownloadFile {
    private static final int BUF_SIZE = 8192;   // 8kB buffer
    private static final int CONNECT_TIMEOUT = 30000; // 30s timeout for making connection
    private static final int READ_TIMEOUT = 30000;    // 30s timeout for reading data

    /**
     * Synchronously download the given URL to the given destination directory.
     *
     * @param u the URL to be downloaded
     * @param destDir the destination directory
     * @return the downloaded file
     */
    public static File downloadFile(URL u, File destDir) throws IOException {
        File f = new File(destDir, getFilenameFromPath(u.getPath()));

        InputStream in = openStream(u);
        OutputStream out = new FileOutputStream(f);
        byte[] buf = new byte[BUF_SIZE];
        int bytesRead;
        while ((bytesRead = in.read(buf)) != -1) {
            out.write(buf, 0, bytesRead);
        }

        return f;
    }
    
    public static String getFilenameFromPath(String path) {
        int lastSlashIndex = path.lastIndexOf(System.getProperty("file.separator"));
        if (lastSlashIndex == -1) {
            lastSlashIndex = path.lastIndexOf("/");
        }
        return path.substring(lastSlashIndex+1, path.length());
    }

    /**
     * Synchronously download a (small) file and read its contents to a String.
     *
     * @param u the URL to be downloaded
     * @return a string containing the contents of the URL
     */
    public static String downloadFile(URL u) throws IOException {

        StringBuilder result = new StringBuilder();

        InputStream in = openStream(u);
        byte[] buf = new byte[BUF_SIZE];
        int bytesRead;
        while ((bytesRead = in.read(buf)) != -1) {
            char [] r = (new String(buf)).toCharArray();
            result.append(r, 0, bytesRead);
        }

        return result.toString();
    }

    /**
     * Download a file in the background.  Notification events will be sent to the
     * supplied listener.
     *
     * @param u the HTTP URL to be downloaded
     * @param destDir destination directory for the file
     * @param monitor will receive DownloadEvents
     */
    public static void downloadFile(final URL u, final File destDir, final DownloadMonitor monitor) {
        new Thread() {
            double totalBytes;

            @Override
            public void run() {
                try {
                    HttpURLConnection httpConn = (HttpURLConnection) u.openConnection();
                    totalBytes = httpConn.getContentLength();

                    File destFile = new File(destDir, getFilenameFromPath(u.getPath()));
                    OutputStream out = new FileOutputStream(destFile);
                    InputStream in = openStream(u);
                    fireDownloadEvent(monitor, new DownloadEvent(DownloadEvent.Type.STARTED));
                    byte[] buf = new byte[BUF_SIZE];
                    long bytesSoFar = 0;
                    int bytesRead;
                    while ((bytesRead = in.read(buf)) != -1 && !monitor.isCancelled()) {
                        out.write(buf, 0, bytesRead);
                        if (totalBytes > 0.0) {
                            bytesSoFar += bytesRead;
                            monitor.handleEvent(new DownloadEvent(bytesSoFar / totalBytes));
                        }
                    }
                    fireDownloadEvent(monitor, new DownloadEvent(destFile));
                } catch (IOException x) {
                    fireDownloadEvent(monitor, new DownloadEvent(x));
                }
            }
        }.start();
    }

    /**
     * Open a stream for the given URL with the CONNECT_TIMEOUT and READ_TIMEOUT.
     * @throws IOException
     */
    private static InputStream openStream(URL url) throws IOException {
        URLConnection conn = url.openConnection();
        conn.setConnectTimeout(CONNECT_TIMEOUT);
        conn.setReadTimeout(READ_TIMEOUT);
        return conn.getInputStream();
    }

    private static void fireDownloadEvent(final Listener<DownloadEvent> listener, final DownloadEvent e) {
        invokeLaterIfNecessary(new Runnable() {
            @Override
            public void run() {
                listener.handleEvent(e);
            }
        });
    }
    
    public static void invokeLaterIfNecessary(Runnable r) {
        if (EventQueue.isDispatchThread()) {
            r.run();
        } else {
            EventQueue.invokeLater(r);
        }
    }
}