package com.soma.core.tools.cli;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.GnuParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.io.FileUtils;

public class Main {
	
	private static final String DEFAULT_TEMPLATE_PATH = "http://www.soundstep.com/somacorejs/templates";
	private static final String DEFAULT_TEMPLATE_EXTENSION = ".zip";
	private static final String DEFAULT_TEMPORARY_FOLDER_NAME = "build-template-temp";
	
	private static final String TOKEN_APPLICATION_NAME = "___APPLICATION_NAME___";
	private static final String TOKEN_MOOTOOLS_VERSION = "___MOOTOOLS_VERSION___";
	private static final String TOKEN_SOMACORE_VERSION = "___SOMACORE_VERSION___";

	private static final String OPTION_NAME = "n";
	private static final String OPTION_NAMESPACE = "ns";
	private static final String OPTION_OUTPUT = "o";
	private static final String OPTION_TEMPLATE = "t";
	private static final String OPTION_TEMPLATE_LOCATION = "l";
	private static final String OPTION_HELP = "h";
	
	private static final String TEMPLATE_STANDARD = "standard";
	private static final String TEMPLATE_STANDARD_NAMESPACE = "standard-namespace";
	private static final String TEMPLATE_COMPACT = "compact";
	private static final String TEMPLATE_COMPACT_NAMESPACE = "compact-namespace";
	
	private static final int FILE_CHUNK = 1024;
	
	private static String[] _args;
	
	private static CommandLine _cli;
	private static Options _options;
	private static CommandLineParser _parser;
	private static HelpFormatter _formatter;
	
	private static ArrayList<String> _templateNames;
	private static Option[] _userOptions;
	
	private static String _currentApplicationName;
	private static String _currentNamespace;
	private static String _currentTemplate;
	private static String _currentOutput;
	private static String _currentTemplateLocation;

	public static void main(String[] args) {
		_args = args;
		createElements();
		createTemplateNames();
		createOptions();
		process();
		getTemplate();
		processFiles();
		processTokens();
		
		System.out.println("name: " + _currentApplicationName);
		System.out.println("namespace: " + _currentNamespace);
		System.out.println("template: " + _currentTemplate);
		System.out.println("output: " + _currentOutput);
		System.out.println("output: " + _currentTemplateLocation);
	}

	private static void createElements() {
		_options = new Options();
		_parser = new GnuParser();
		_formatter = new HelpFormatter();
	}

	private static void createTemplateNames() {
		_templateNames = new ArrayList<String>();
		_templateNames.add(TEMPLATE_STANDARD);
		_templateNames.add(TEMPLATE_STANDARD_NAMESPACE);
		_templateNames.add(TEMPLATE_COMPACT);
		_templateNames.add(TEMPLATE_COMPACT_NAMESPACE);
	}
	
	private static void createOptions() {
		_options.addOption(OPTION_NAME, "name", true, "application name");
		_options.addOption(OPTION_NAMESPACE, "namespace", true, "javascript namespace");
		_options.addOption(OPTION_OUTPUT, "output", true, "path used to create the application");
		_options.addOption(OPTION_TEMPLATE, "template", true, "template used to create the application, templates available: " + getFormattedTemplateNames());
		_options.addOption(OPTION_TEMPLATE_LOCATION, "template-location", true, "location of the templates");
		_options.addOption(OPTION_HELP, "help", false, "how to use the somacorejs command line interface");
	}

	private static void process() {
		try {
			_cli = _parser.parse(_options, _args);
			if (_cli.getOptions().length > 0) {
				_userOptions = _cli.getOptions();
				for (Option option : _userOptions) {
					processArgument(option.getOpt());
				}
			}
			setDefaultValues();
		} catch (ParseException e) {
			System.out.println( "Unexpected exception:" + e.getMessage() );
		}
	}

	private static void setDefaultValues() {
		if (_currentApplicationName == null) _currentApplicationName = "application";
		if (_currentNamespace == null) _currentNamespace = "app";
		if (_currentTemplate == null) _currentTemplate = TEMPLATE_STANDARD;
		if (_currentOutput == null) _currentOutput = "";
		if (_currentTemplateLocation == null) _currentTemplateLocation = DEFAULT_TEMPLATE_PATH;
	}

	private static void processArgument(String arg) {
		if (arg.equals(OPTION_NAME)) {
			_currentApplicationName = _cli.getOptionValue(arg);
		}
		else if (arg.equals(OPTION_NAMESPACE)) {
			_currentNamespace = _cli.getOptionValue(arg);
		}
		else if (arg.equals(OPTION_TEMPLATE)) {
			if (!isValidTemplate(_cli.getOptionValue(arg))) {
				System.out.println("Invalid template name, options available: " + getFormattedTemplateNames());
				System.exit(0);
			}
			_currentTemplate = _cli.getOptionValue(arg);
		}
		else if (arg.equals(OPTION_TEMPLATE_LOCATION)) {
			_currentTemplateLocation = _cli.getOptionValue(arg);
		}
		else if (arg.equals(OPTION_OUTPUT)) {
			_currentOutput = (arg.equals(".") || arg.equals("./")) ? "" : _cli.getOptionValue(arg);
		}
	}

	private static void getTemplate() {
		if (_currentTemplateLocation.indexOf("http") == -1) {
			copyTemplate();
		}
		else {
			downloadTemplate();
		}
		
	}

	private static void copyTemplate() {
		String lastCharacter = _currentTemplateLocation.substring(_currentTemplateLocation.length() - 1, _currentTemplateLocation.length());
		String location = _currentTemplateLocation;
		if (lastCharacter.equals("/") || lastCharacter.equals("\\")) {
			location = location.substring(0, location.length()-1);
		}
		String templateFileName = _currentTemplate + DEFAULT_TEMPLATE_EXTENSION;
		String templateFilePathSource = location + "/" + templateFileName;
		String templateFilePathDestination = DEFAULT_TEMPORARY_FOLDER_NAME + "/" + templateFileName;
		try {
			FileUtils.copyFile(new File(templateFilePathSource), new File(templateFilePathDestination));
		} catch (IOException e) {
			System.out.println("an error has occured: " + e.getMessage());
			System.exit(0);
		}
	}

	private static void downloadTemplate() {
		try {
			String templateFileName = _currentTemplate + DEFAULT_TEMPLATE_EXTENSION;
			String templateFileUrlString = _currentTemplateLocation + "/" + templateFileName;
			String templateFilePath = DEFAULT_TEMPORARY_FOLDER_NAME + "/" + templateFileName;
			File templateFile = new File(templateFilePath);
			new File(DEFAULT_TEMPORARY_FOLDER_NAME).mkdir();
			URL url = new URL(templateFileUrlString);
			InputStream reader = url.openStream();
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
            int totalBytes = httpConn.getContentLength();
			FileOutputStream writer = new FileOutputStream(templateFile);
	        byte[] buffer = new byte[FILE_CHUNK];
	        double totalBytesRead = 0;
	        double bytesRead = 0;
	        while ((bytesRead = reader.read(buffer)) > 0) {  
	           writer.write(buffer, 0, (int)bytesRead);
	           buffer = new byte[FILE_CHUNK];
	           totalBytesRead += bytesRead;
	           printProgress(totalBytesRead, totalBytes);
	        }
	        writer.close();
	        reader.close();
	        System.out.print("\n");
		} catch (MalformedURLException e) {
			System.out.println("template url is invalid: " + e.getMessage());
			System.exit(0);
		} catch (IOException e) {
			System.out.println("an error has occured: " + e.getMessage());
			System.exit(0);
		}
	}
	
	private static String getApplicationDir() {
		String applicationDirName = _currentApplicationName;
		int count = 1;
		while (true) {
			applicationDirName = (count == 1) ? _currentApplicationName : _currentApplicationName + Integer.toString(count);
			if (!new File(applicationDirName).exists()) {
				break;
			}
			count++;
		}
		return applicationDirName;
	}
	
	private static void processFiles() {
		String templateFileName = _currentTemplate + DEFAULT_TEMPLATE_EXTENSION;
		String templateFilePath = DEFAULT_TEMPORARY_FOLDER_NAME + "/" + templateFileName;
		File templateFile = new File(templateFilePath);
		String applicationDirName = getApplicationDir();
		try {
			ZipUtils.unzipArchive(templateFile, new File(DEFAULT_TEMPORARY_FOLDER_NAME));
			new File(DEFAULT_TEMPORARY_FOLDER_NAME + "/" + _currentTemplate).renameTo(new File(DEFAULT_TEMPORARY_FOLDER_NAME + "/" + applicationDirName));
			FileUtils.moveDirectory(new File(DEFAULT_TEMPORARY_FOLDER_NAME + "/" + applicationDirName), new File(applicationDirName));
			FileUtils.deleteDirectory(new File(DEFAULT_TEMPORARY_FOLDER_NAME));
		} catch (IOException e) {
			System.out.println("an error has occured (cleaning): " + e.getMessage());
			System.exit(0);
		}
	}
	
	private static void processTokens() {
		
	}

	public static void printProgress(double bytesLoaded, double totalBytes){
		int percent = (int)((bytesLoaded / totalBytes) * 100);
		StringBuilder bar = new StringBuilder();
		bar.append(percent);
		bar.append("%");
		bar.append(" - ");
		bar.append((int)bytesLoaded);
		bar.append("/");
		bar.append((int)totalBytes);
		System.out.print("\r" + bar.toString());
	}

	private static boolean isValidTemplate(String value) {
		for (int i = 0; i < _templateNames.size(); i++) {
			if (value.equals(_templateNames.get(i))) {
				return true;
			}
		}
		return false;
	}

	private static String getFormattedTemplateNames() {
		return _templateNames.toString();
	}

	private static void printLine(String value) {
		System.out.println(value);
	}

}
