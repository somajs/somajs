<?php

    require_once('http.class.php');

    class GithubOAuth
    {
        const BaseURL = 'https://api.github.com';
        const urlAuthorize = 'https://github.com/login/oauth/authorize';
        const urlAccessToken = 'https://github.com/login/oauth/access_token';

        public $client_id;
        public $client_secret;
        public $access_token;

        public function __construct( $client_id, $client_secret ) {
            if( empty( $client_id ) ) throw new Exception( "Parameter 'client_id' was empty." );
            $this->client_id = $client_id; 

            if( empty( $client_secret ) ) throw new Exception( "Parameter 'client_secret' was empty." );
            $this->client_secret = $client_secret;
        }

        public function requestAccessCode( $scope ) {
            if( !empty( $this->access_token ) ) throw new Exception( 'Already authorized.' );
            $urlParams = array( 'client_id' => $this->client_id );

            if( empty( $scope ) ) throw new Exception( "Parameter 'scope' was empty." );
            $urlParams['scope'] = implode( ',', $scope );

            $request = HTTP::buildRequest( GithubOAuth::urlAuthorize, $urlParams );
            header( "Location: $request" );
        }

        public function requestAccessToken( $code ) {
            $urlParams = array(
                'client_id'    => $this->client_id,
                'client_secret'=> $this->client_secret,
                'code'         => $code
            );
            return HTTP::webRequest( 'POST', GithubOAuth::urlAccessToken, $urlParams );
        }

        public function setToken( $accessToken ) {
            if( empty( $accessToken ) ) throw new Exception( "Parameter 'accessToken' was empty." );
            $replace = array(
                'access_token=',
                '&token_type=bearer',
            );
            $this->access_token = trim( str_replace( $replace, array( '', '' ), $accessToken ) );
        }

        public function setTokenFromCode( $code ) {
            $token = $this->requestAccessToken( $code );
            $this->setToken( $token );
        }

        public function getToken() {
            if( empty( $this->access_token ) ) throw new Exception( 'Access token has not yet been set.' );
            return $this->access_token;
        }

        public function executeRequest( $HTTPVerb, $path, array $urlParams = array() ) {
            $HTTPVerb = strtoupper( $HTTPVerb );
            $url = GithubOAuth::BaseURL;
            $url .= ( $path[0] == '/' ) ? "{$path}" : "/{$path}";

            if( $HTTPVerb == 'POST' || $HTTPVerb == 'PATCH' || $HTTPVerb == 'PUT' || $HTTPVerb == 'DELETE') {
                $url .= '?access_token=' . $this->access_token;
                return HTTP::webRequest( $HTTPVerb, $url, $urlParams );
            } else {
                if( empty( $urlParams['access_token'] ) )
                    $urlParams['access_token'] = $this->access_token;
                return HTTP::webRequest( $HTTPVerb, $url, $urlParams );
            }
        }
    }

?>
