<?php
/**
 * CIE-2 Activity Tracking, Evaluation and Performance Management System
 * File: backend/api/jwt.php
 * Purpose: Custom HMAC-SHA256 JWT class with encode/decode options.
 */

// Load db config function to read JWT secret
require_once __DIR__ . '/db.php';

class JWT
{
    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data)
    {
        $b64 = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode(str_pad($b64, strlen($b64) % 4, '=', STR_PAD_RIGHT));
    }

    /**
     * Signs a payload and returns a token string.
     */
    public static function sign($payload, $expirySeconds = JWT_EXPIRY_SECONDS)
    {
        $secret = JWT_SECRET;

        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);

        // Add expiration claim
        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verifies a JWT token signature and returns the payload if valid.
     */
    public static function verify($token)
    {
        $secret = JWT_SECRET;
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($headerB64, $payloadB64, $signatureB64) = $parts;
        $signature = self::base64UrlDecode($signatureB64);

        $expectedSignature = hash_hmac('sha256', $headerB64 . "." . $payloadB64, $secret, true);
        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);

        // Check timeout
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * Extract token from HTTP Request headers.
     */
    public static function getBearerToken()
    {
        $headers = self::getRequestHeaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }

        // Check cookie as backup
        if (isset($_COOKIE['token'])) {
            return $_COOKIE['token'];
        }

        return null;
    }

    private static function getRequestHeaders()
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (substr($key, 0, 5) <> 'HTTP_') {
                continue;
            }
            $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
            $headers[$header] = $value;
        }
        return $headers;
    }
}
