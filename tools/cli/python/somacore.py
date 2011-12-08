#!/usr/bin/env python
import os, sys, urllib2
import cli.app, cli.log

# print "Hello world"

# @cli.app.CommandLineApp
# def ls(app):
#     pass
# ls.add_param("-l", "--long", help="list in long format", default=False, action="store_true")
# if __name__ == "__main__":
#     ls.run()

# @cli.log.LoggingApp
# def sleep(app):
#     app.log.debug("About to sleep for %d seconds" % app.params.seconds)
#     time.sleep(app.params.seconds)
# sleep.add_param("seconds", help="time to sleep", default=1, type=int)
# if __name__ == "__main__":
# 	sleep.run()

@cli.app.CommandLineApp
#@cli.log.LoggingApp
def somacore(app):
    do_stuff(app)

template_names = ['standard', 'compact', 'standard-namespace', 'compact-namespace']
message_error_tni = "ERROR: Template name doesn't exist. Here are the templates available:"
message_start_download = "downloading template..."
message_end_download = "download Successful"
template_url_location = "http://www.soundstep.com/somacorejs/templates"

somacore.add_param("-n", "--name", default="my_app", help="application name")
somacore.add_param("-ns", "--namespace", default="app", help="application namespace")
somacore.add_param("-o", "--output", help="folder in which the application is created")
somacore.add_param("-t", "--template", default="standard", help="template used to create the application, templates available: " + str(template_names).strip('[]'))

def do_stuff(app):
	# app.log.info("About to daemonize")
	# if app.params.name:
	# 	print app.params
	# else:
	# 	print "no"
	
	if commands_are_valid(app) == False:
		return
	
	current_path = get_current_path(app.params.output)
	download_templates(current_path, app.params.template)
	
	# LOG INFO
	print "name: ", app.params.name
	print "namespace: ", app.params.namespace
	print "path: ", current_path
	print "template: ", app.params.template

def download_templates(path, template_name):
	file_name = template_name + ".zip"
	# file_name = "test.zip"
	print file_name
	u = urllib2.urlopen(template_url_location + "/" + file_name)
	print u
	f = open(file_name, 'wb')
	print f
	meta = u.info()
	print meta
	file_size = int(meta.getheaders("Content-Length")[0])
	print file_size
	file_size_dl = 10
	block_sz = 8192
	print message_start_download + "(" + template_name + ")"
	while True:
		buffer = u.read(block_sz)
		if not buffer:
		        break
		file_size_dl += len(buffer)
		f.write(buffer)
		status = r"%10d  [%3.2f%%]" % (file_size_dl, file_size_dl * 100. / file_size)
		status = status + chr(8)*(len(status)+1)
		print status,
	f.close()
	print message_end_download

def commands_are_valid(app):
	result = template_is_valid(app.params.template)
	return result;

def get_current_path(value):
	current_path = os.getcwd()
	if value != None and value != "." and value != "./":
		current_path = value
	return current_path

def template_is_valid(value):
	result = False
	for t in template_names:
		if t == value:
			result = True
			break
	if result == False:
		print message_error_tni
		for t in template_names:
			print "  - ", t
	return result

def log_os_info(app):
	print 'my os.getcwd =>', os.getcwd( ) # show my cwd execution dir
	print 'my sys.path =>', sys.path[:6] # show first 6 import paths
	#raw_input() # wait for keypress if clicked
	
if __name__ == "__main__":
	somacore.run()
