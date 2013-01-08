<?php

require 'lib/http.class.php';
require 'lib/githuboauth.class.php';

// https://github.com/csphere/GithubApiWrapper-PHP

// ID & Secret shown on your Github app's page.
$clientID = 'e2d003ab7d4f9f1bbc4e';
$clientSecret = '4c526ff85a13091ff484d9de1629cea8f6c32485';
$github = new GithubOAuth( $clientID, $clientSecret );

// Scope of permissions requested
$scope = array( 'gist' );
// Requests access & redirects to the URL defined in your Github application's settings
$github->requestAccessCode( $scope );

?>