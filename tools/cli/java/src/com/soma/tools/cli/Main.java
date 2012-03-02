package com.soma.tools.cli;

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
import org.apache.commons.lang3.StringUtils;

public class Main {
	
	private static final String DEFAULT_TEMPLATE_PATH = "http://somajs.github.com/somajs/templates/mootools";
	private static final String DEFAULT_TEMPLATE_EXTENSION = ".zip";
	private static final String DDEFAULT_TEMPORARY_FOLDER_NAME = "scjs-btt";
	
	private static final String TOKEN_APPLICATION_NAME = "___APPLICATION_NAME___";
	private static final String TOKEN_APPLICATION_NAME_FORMATTED = "___APPLICATION_NAME_FORMATTED___";
	private static final String TOKEN_APPLICATION_NAMESPACE = "___APPLICATION_NAMESPACE___";

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
	
	private static File _temporaryFolder;
	
	private static ArrayList<String> _templateNames;
	private static Option[] _userOptions;
	
	private static String _currentApplicationName;
	private static String _currentNamespace;
	private static String _currentTemplate;
	private static String _currentOutput;
	private static String _currentTemplateLocation;
	private static String _applicationDirName;
	private static InputStream _reader;
	private static FileOutputStream _writer;

	public static void main(String[] args) {
		_args = args;
		printBeginning();
		createElements();
		createTempFolder();
		createTemplateNames();
		createOptions();
		processArguments();
		setApplicationDir();
		getTemplate();
		processFiles();
		processTokens();
		printEnd();
		cleanup();
		
//		System.out.println("name: " + _currentApplicationName);
//		System.out.println("namespace: " + _currentNamespace);
//		System.out.println("template: " + _currentTemplate);
//		System.out.println("output: " + _currentOutput);
//		System.out.println("location: " + _currentTemplateLocation);
	}

	private static void cleanup() {
		deleteTempFolder();
	}

	private static void printBeginning() {
		System.out.println("soma.js application creation in progress");
	}

	private static void printEnd() {
		System.out.println("soma.js application created in:");
		System.out.println(new File(getCurrentOutput() + _applicationDirName).getAbsolutePath());
	}

	private static void createTempFolder() {
		_temporaryFolder = new File(FileUtils.getTempDirectory() + "/" + DDEFAULT_TEMPORARY_FOLDER_NAME);
		_temporaryFolder.mkdir();
	}

	private static void deleteTempFolder() {
		_temporaryFolder.deleteOnExit();
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
		_options.addOption(OPTION_OUTPUT, "output", true, "directory used to create the application");
		_options.addOption(OPTION_TEMPLATE, "template", true, "template used to create the application, templates available: " + getFormattedTemplateNames());
		_options.addOption(OPTION_TEMPLATE_LOCATION, "template-location", true, "location of the templates (optional)");
		_options.addOption(OPTION_HELP, "help", false, "help");
	}

	private static void processArguments() {
		try {
			_cli = _parser.parse(_options, _args);
			if (_cli.hasOption(OPTION_HELP)) {
				printHelp();
				System.exit(0);
			}
			if (_cli.getOptions().length > 0) {
				_userOptions = _cli.getOptions();
				for (Option option : _userOptions) {
					processArgument(option.getOpt());
				}
			}
			setDefaultValues();
		} catch (ParseException e) {
			System.out.println( "Unexpected exception:" + e.getMessage() );
			System.exit(0);
		}
	}

	private static void printHelp() {
		StringBuilder str = new StringBuilder();
		str.append("soma.js command line interface\n");
		str.append("usage examples:\n");
		str.append(" >java jar somajs.jar -n my_application -ns my_app\n");
		str.append(" >java jar somajs.jar -o /Users/my_user/Desktop\n");
		str.append(" >java jar somajs.jar -t compact-namespace\n");
		str.append(" >java jar somajs.jar -l http://domain.com/templates\n");
		str.append(" >java jar somajs.jar -l /Users/my_user/templates\n");
		_formatter.printHelp(str.toString(), _options);
	}

	private static void setDefaultValues() {
		if (_currentApplicationName == null) _currentApplicationName = "application";
		if (_currentNamespace == null) _currentNamespace = "app";
		if (_currentTemplate == null) _currentTemplate = TEMPLATE_STANDARD;
		if (_currentOutput == null) _currentOutput = "";
		if (_currentTemplateLocation == null) _currentTemplateLocation = DEFAULT_TEMPLATE_PATH;
	}
	
	private static String getApplicationNameFormatted() {
		String appname = _currentApplicationName.toLowerCase();
		appname = StringUtils.replace(appname, " ", "_");
		appname = StringUtils.replace(appname, "/", "");
		appname = StringUtils.replace(appname, "\\", "");
		appname = StringUtils.replace(appname, "%", "");
		appname = StringUtils.replace(appname, "&", "");
		appname = StringUtils.replace(appname, "&", "");
		return appname;
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
		String templateFilePathDestination = getTempFolder() + "/" + templateFileName;
		try {
			FileUtils.copyFile(new File(templateFilePathSource), new File(templateFilePathDestination));
		} catch (IOException e) {
			System.out.println("an error has occured: " + e.getMessage());
			System.exit(0);
		}
	}

	private static File getTempFolder() {
		return _temporaryFolder;
	}

	private static void downloadTemplate() {
		try {
			String templateFileName = _currentTemplate + DEFAULT_TEMPLATE_EXTENSION;
			String templateFileUrlString = _currentTemplateLocation + "/" + templateFileName;
			String templateFilePath = getTempFolder().getPath() + "/" + templateFileName;
			File templateFile = new File(templateFilePath);
			new File(getTempFolder().getPath()).mkdir();
			URL url = new URL(templateFileUrlString);
			_reader = url.openStream();
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();
            int totalBytes = httpConn.getContentLength();
			_writer = new FileOutputStream(templateFile);
	        byte[] buffer = new byte[FILE_CHUNK];
	        double totalBytesRead = 0;
	        double bytesRead = 0;
	        while ((bytesRead = _reader.read(buffer)) > 0) {  
	           _writer.write(buffer, 0, (int)bytesRead);
	           buffer = new byte[FILE_CHUNK];
	           totalBytesRead += bytesRead;
	           printProgress(totalBytesRead, totalBytes);
	        }
	        System.out.print("\n");
		} catch (MalformedURLException e) {
			System.out.println("template url is invalid: " + e.getMessage());
			System.exit(0);
		} catch (IOException e) {
			System.out.println("an error has occured: " + e.getMessage());
			System.exit(0);
		} finally {
			try {
				_reader.close();
				_writer.close();
				_writer.flush();
				_reader = null;
				_writer = null;
				System.gc();
			} catch (IOException e) {
				System.out.println("an error has occured: " + e.getMessage());
				System.exit(0);
			}
		}
	}
	
	private static void setApplicationDir() {
		if (_applicationDirName != null) throw new Error("This method should not be called twice");
		String appDirName = _currentApplicationName;
		int count = 1;
		while (true) {
			appDirName = (count == 1) ? _currentApplicationName : _currentApplicationName + Integer.toString(count);
			if (!new File(getCurrentOutput() + appDirName).exists()) {
				break;
			}
			count++;
		}
		_applicationDirName = appDirName;
	}
	
	private static void processFiles() {
		String templateFileName = _currentTemplate + DEFAULT_TEMPLATE_EXTENSION;
		String templateFilePath = getTempFolder().getPath() + "/" + templateFileName;
		File templateFile = new File(templateFilePath);
		try {
			ZipUtils.unzipArchive(templateFile, new File(getTempFolder().getPath() + "/" + _currentTemplate));
			new File(getTempFolder().getPath() + "/" + _currentTemplate).renameTo(new File(getTempFolder().getPath() + "/" + _applicationDirName));
			FileUtils.moveDirectory(new File(getTempFolder().getPath() + "/" + _applicationDirName), new File(getCurrentOutput() + _applicationDirName));
		} catch (IOException e) {
			System.out.println("an error has occured (cleaning): " + e.getMessage());
			System.exit(0);
		}
	}
	
	private static String getCurrentOutput() {
		return _currentOutput == "" ? "" : _currentOutput + "/";
	}
	
	private static void processTokens() {
		renameFiles(new File(getCurrentOutput() + _applicationDirName), TOKEN_APPLICATION_NAME_FORMATTED, getApplicationNameFormatted());
		renameFiles(new File(getCurrentOutput() + _applicationDirName), TOKEN_APPLICATION_NAME, _currentApplicationName);
		replaceTokens(new File(getCurrentOutput() + _applicationDirName), TOKEN_APPLICATION_NAME_FORMATTED, getApplicationNameFormatted());
		replaceTokens(new File(getCurrentOutput() + _applicationDirName), TOKEN_APPLICATION_NAME, _currentApplicationName);
		replaceTokens(new File(getCurrentOutput() + _applicationDirName), TOKEN_APPLICATION_NAMESPACE, _currentNamespace);
	}

	private static void renameFiles(File file, String token, String targetValue) {
		String name = file.getName();
		name = StringUtils.replace(name, token, targetValue);
		if (!name.equals(file.getName())) {
			String parentPath = file.getParentFile().getPath();
			file.renameTo(new File(parentPath + "/" + name));
		}
		// next
		if (file.isDirectory()) {
			File[] files = file.listFiles();
			for (int i = 0; i < files.length; i++) {
				renameFiles(files[i], token, targetValue);
			}
		}
	}
	
	private static void replaceTokens(File file, String token, String targetValue) {
		if (file.isFile()) {
			try {
				replaceInFile(file, token, targetValue);
			} catch (IOException e) {
				System.out.println("an error has occured (cleaning): " + e.getMessage());
				System.exit(0);
			}
		}
		else {
			File[] files = file.listFiles();
			for (int i = 0; i < files.length; i++) {
				replaceTokens(files[i], token, targetValue);
			}
		}
	}
	
	public static void replaceInFile(File file, String token, String targetValue) throws IOException {
		String content = FileUtils.readFileToString(file);
	    FileUtils.writeStringToFile(file, content.replaceAll(token, targetValue));
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

}
