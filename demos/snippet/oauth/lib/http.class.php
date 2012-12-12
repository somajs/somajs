<?php

    // ENUM implementation
    class HTTPVerbs
    {
        const HEAD = 'HEAD';
        const GET = 'GET';
        const POST = 'POST';
        const PATCH = 'PATCH';
        const PUT = 'PUT';
        const DELETE = 'DELETE';
    }

    class HTTP
    {
        public static function webRequest( $HTTPVerb, $url, array $urlParams = array() ) {
            switch( strtoupper( $HTTPVerb ) ) {
                case HTTPVerbs::HEAD:
                    return HTTP::httpHEAD( $c, $url, $urlParams );
                case HTTPVerbs::GET;
                    return HTTP::httpGET( $c, $url, $urlParams );
                case HTTPVerbs::POST:
                    return HTTP::httpPOST( $c, $url, $urlParams );
                case HTTPVerbs::PATCH:
                    return HTTP::httpPATCH( $c, $url, $urlParams );
                case HTTPVerbs::PUT:
                    return HTTP::httpPUT( $c, $url, $urlParams );
                case HTTPVerbs::DELETE:
                    return HTTP::httpDELETE( $c, $url, $urlParams );
                default:
                    throw new Exception( "Parameter 'HTTPVerb' invalid. Valid options found in GithubOauth::HTTPVerbs." );
            }
        }

        // Can be issued against any resource to get just the HTTP header info.
        private static function httpHEAD( $c, $url, $urlParams ) {
            $c = curl_init();
            curl_setopt( $c, CURLOPT_URL, $url );
            curl_setopt( $c, CURLOPT_HEADER, 1 );
            curl_setopt( $c, CURLOPT_NOBODY, 1 );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, 1 );
            curl_exec( $c );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return json_encode( $headers );
        }

        // Used for retrieving resources.
        private static function  httpGET( $c, $url, $urlParams ) {
            $c = curl_init();
            $request = HTTP::buildRequest( $url, $urlParams );
            curl_setopt( $c, CURLOPT_URL, $request );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, true );
            $response = json_decode( curl_exec( $c ) );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return json_encode( compact( 'headers', 'response' ) );
        }

        // Used for creating resources, or performing custom actions (such as merging a pull request).
        private static function  httpPOST( $c, $url, $urlParams ) {
            $c = curl_init();
            $requestingToken = $url == GithubOAuth::urlAccessToken;
            curl_setopt( $c, CURLOPT_URL, $url );
            curl_setopt( $c, CURLOPT_POST, 1 );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, false );
            curl_setopt( $c, CURLOPT_SSL_VERIFYPEER, false );
            curl_setopt( $c, CURLOPT_SSL_VERIFYHOST, 0 );
            curl_setopt( $c, CURLOPT_POSTFIELDS, $requestingToken ? $urlParams : json_encode( $urlParams ) );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, true );
            $response = $requestingToken ? curl_exec( $c ) : json_decode( curl_exec( $c ) );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return $requestingToken ? $response : json_encode( compact( 'headers', 'response' ) );
        }

        // Used for updating resources with partial JSON data. For instance, an Issue resource has title and
        // body attributes. A PATCH request may accept one or more of the attributes to update the resource.
        // PATCH is a relatively new and uncommon HTTP verb, so resource endpoints also accept POST requests.
        private static function  httpPATCH( $c, $url, $urlParams ) {
            $c = curl_init();
            curl_setopt( $c, CURLOPT_URL, $url );
            curl_setopt( $c, CURLOPT_HEADER, false );
            curl_setopt( $c, CURLOPT_CUSTOMREQUEST, 'PATCH' );
            curl_setopt( $c, CURLOPT_POSTFIELDS, json_encode( $urlParams ) );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, true );
            $response = json_decode( curl_exec( $c ) );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return json_encode( compact( 'headers', 'response' ) );
        }

        // Used for replacing resources or collections.
        private static function  httpPUT( $c, $url, $urlParams ) {
            $c = curl_init();
            $putString = stripslashes( json_encode( $urlParams ) );
            $data = tmpfile();
            fwrite( $data, $putString );
            fseek( $data, 0 );
            curl_setopt( $c, CURLOPT_URL, $url );
            curl_setopt( $c, CURLOPT_PUT, true );
            curl_setopt( $c, CURLOPT_INFILE, $data );
            curl_setopt( $c, CURLOPT_BINARYTRANSFER, true );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, true );
            curl_setopt( $c, CURLOPT_INFILESIZE, strlen( $putString ) );
            curl_exec( $c );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return json_encode( $headers );
        }

        // Used for deleting resources.
        private static function  httpDELETE( $c, $url, $urlParams ) {
            $c = curl_init();
            curl_setopt( $c, CURLOPT_URL, $url );
            curl_setopt( $c, CURLOPT_POSTFIELDS, json_encode( $urlParams ) );
            curl_setopt( $c, CURLOPT_FOLLOWLOCATION, 1 );
            curl_setopt( $c, CURLOPT_HEADER, 0 );
            curl_setopt( $c, CURLOPT_RETURNTRANSFER, 1 );
            curl_setopt( $c, CURLOPT_CUSTOMREQUEST, 'DELETE' );
            $response = json_decode( curl_exec( $c ) );
            $headers = curl_getinfo( $c );
            curl_close( $c );
            return json_encode( compact( 'headers', 'response' ) );
        }

        public static function buildRequest( $url, $urlParams ) {
            $request = $url;
            if( !empty( $urlParams ) ) {
                foreach( $urlParams as $k => $v ) {
                    $request .= ( strstr( $request, '?' ) ) ? '&' : '?';
                    $request .= ( $k . '=' . $v );
                }
            }
            return $request;
        }
    }

?>