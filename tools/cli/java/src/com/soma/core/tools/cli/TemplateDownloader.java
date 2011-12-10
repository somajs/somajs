package com.soma.core.tools.cli;

import java.io.File;
import java.net.URL;

import savant.net.DownloadEvent;
import savant.net.DownloadEvent.Type;
import savant.net.DownloadFile;
import savant.net.DownloadMonitor;

public class TemplateDownloader implements DownloadMonitor {

	private double _progress;
	private boolean _complete;

	public TemplateDownloader() {
		
	}

	public void downloadFile(URL url, File dir) {
		DownloadFile.downloadFile(url, dir, this);
	}
	
	public double getProgress() {
		return _progress;
	}

	@Override
	public void handleEvent(DownloadEvent event) {
		// TODO Auto-generated method stub
		_progress = event.getProgress();
		System.out.println("----" + event.getProgress());
		if (event.getType().equals(Type.COMPLETED)) {
			_complete = true;
			System.out.println("complete");
		}
	}

	@Override
	public boolean isCancelled() {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean isComplete() {
		return _complete;
	}

}
