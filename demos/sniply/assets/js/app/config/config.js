;(function(sniply, undefined) {

	sniply.config = {
		apiUrl: 'http://sniply.eu01.aws.af.cm',
		oauthCallback: 'http://sniply.eu01.aws.af.cm/oauth/client',
		storeKey: {
			snippet: 'sniply-data',
			user: 'sniply-user'
		}
	};

})(sniply = window.sniply || {});