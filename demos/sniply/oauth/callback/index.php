<?php

require '../lib/http.class.php';
require '../lib/githuboauth.class.php';

// https://github.com/csphere/GithubApiWrapper-PHP

// ID & Secret shown on your Github app's page.
$clientID = 'e2d003ab7d4f9f1bbc4e';
$clientSecret = '4c526ff85a13091ff484d9de1629cea8f6c32485';
$github = new GithubOAuth( $clientID, $clientSecret );

// Retrieve access code from URL after redirect, and exchange for access token
$github->setTokenFromCode( $_GET['code'] );
// $response = $github->executeRequest( 'GET', 'user' );
$token = $github->getToken();

if (strrpos($token, "error") === false) {
    $accessToken = $token;
}
else {
    $error = $_GET['error'];
}
?>

<!DOCTYPE html>
<html>
<head>
	<title>Sign in with Github</title>
</head>
<body>

<script type="text/javascript">
	window.token = '<?=$accessToken ?>';
</script>

</body>
</html>