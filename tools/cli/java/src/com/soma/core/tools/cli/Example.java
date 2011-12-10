package com.soma.core.tools.cli;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.PosixParser;

public class Example {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		Options options = new Options();
		options.addOption("t", "time", false, "display current time");
		options.addOption("h", "help", false, "display help");
		
		CommandLineParser parser = new PosixParser();
		HelpFormatter formatter = new HelpFormatter();
		
		try {
			CommandLine cmd = parser.parse(options, args);
			if (cmd.hasOption("t")) {
				// print date and time
				System.out.println("date and time");
			}
			else if (cmd.hasOption("h")) {
				// print help
				formatter.printHelp("somacore", options);
			}
			else {
				// print date
				System.out.println("date");
			}
		} catch (ParseException e) {
			e.printStackTrace();
		}
		
	}

}
