<?php

namespace lasz_woocommerce;

use lasz_woocommerce\Config as Config;

if (!class_exists('lasz_woocommerce\Theme')) {
  class Theme
  {
    private static $instance = null;

    public static function get_instance()
    {
      if (self::$instance === null) {
        self::$instance = new self;
      }

      return self::$instance;
    }

    private function __construct()
    {
      // Includes
      // --------

      $classes = preg_grep('/^([^.])/', scandir(get_template_directory() . '/includes/classes'));
      $adminClasses = preg_grep('/^([^.])/', scandir(get_template_directory() . '/includes/admin'));

      foreach ($classes as $class) {
        require_once(get_template_directory() . '/includes/classes/' . $class);
      }

      foreach ($adminClasses as $adminClass) {
        require_once(get_template_directory() . '/includes/admin/' . $adminClass);
      }

      require_once(get_template_directory() . '/blocks/blocks.php');

      // Hooks
      // -----

      // disable admin bar
      add_filter('show_admin_bar', '__return_false');

      // disable wp-embed
      add_action('wp_footer', array($this, 'disable_wp_embed'));

      // add svg upload
      add_filter('upload_mimes', array($this, 'add_svg_upload'), 10, 1);

      // allows CORS
      add_action('send_headers', array($this, 'add_cors_http_header'));
      add_action('rest_api_init', array($this, 'add_cors_http_header'));

      // whitelist auth endpoints
      add_filter('jwt_auth_whitelist', array($this, 'whitelist_auth_endpoints'));

      // add user id and role to jwt response
      add_filter('jwt_auth_token_before_dispatch', array($this, 'add_user_id_and_role_to_jwt_response'), 10, 2);

      // use custom profile image
      add_filter('pre_get_avatar', array($this, 'add_pre_get_avatar'), 10, 5);

      // add woo support
      add_action('after_setup_theme', array($this, 'add_woo_support'));

      // add profile image to meta in REST response
      register_meta('user', 'lasz_woocommerce_profile_image', array(
        'type' => 'string',
        'show_in_rest' => true
      ));

      // add profile image id to meta in REST response
      register_meta('user', 'lasz_woocommerce_profile_image_id', array(
        'type' => 'string',
        'show_in_rest' => true
      ));

      // menus
      register_nav_menu('header', 'Header');
      register_nav_menu('drawer', 'Drawer');
      register_nav_menu('top', 'Top');
      register_nav_menu('useful-links', 'Useful Links');
      register_nav_menu('legal', 'Legal');
      register_nav_menu('footer-social-media', 'Footer Social Media');

      // add theme support for post thumbnails
      add_action('after_setup_theme', array($this, 'add_post_thumbnail_support'));

      // redirects
      add_action('template_redirect', array($this, 'redirect_to_new_domain_except_api'));

    }

    public static function add_post_thumbnail_support()
    {
      add_theme_support('post-thumbnails');
    }

    public static function disable_wp_embed()
    {
      wp_deregister_script('wp-embed');
    }

    public static function add_svg_upload($upload_mimes)
    {
      $upload_mimes['svg'] = 'image/svg+xml';
      $upload_mimes['svgz'] = 'image/svg+xml';
      return $upload_mimes;
    }

    public static function enqueue_styles()
    {
      wp_enqueue_style('admin-css', get_theme_file_uri('/admin.css'));
    }

    public static function add_cors_http_header()
    {
      header("Access-Control-Allow-Origin: *");
    }

    public static function whitelist_auth_endpoints($endpoints)
    {
      $endpoints[] = '/wp-json/bdpwr/v1/reset-password';
      $endpoints[] = '/wp-json/bdpwr/v1/set-password';
      $endpoints[] = '/wp-json/bdpwr/v1/validate-code';
      return $endpoints;
    }

    public static function add_user_id_and_role_to_jwt_response($data, $user)
    {
      $data['user_id'] = $user->data->ID;
      $data['role'] = $user->roles[0];
      return $data;
    }

    public static function add_pre_get_avatar($avatar, $id_or_email)
    {
      if (is_numeric($id_or_email)) {
        $user_id = $id_or_email;
      } else {
        $user = get_user_by('email', $id_or_email);
        $user_id = $user->ID;
      }

      $profile_image = get_user_meta($user_id, 'lasz_woocommerce_profile_image', true);

      if (!empty($profile_image)) {
        $avatar = "<img src='" . $profile_image . "' alt='Profile Image' />";
      }

      return $avatar;
    }

    public static function add_woo_support() {
      add_theme_support('woocommerce');
    }


    public static function redirect_to_new_domain_except_api() {
      // 1. Check if it's a standard WordPress REST API request
      if (defined('REST_REQUEST') && REST_REQUEST) {
        return;
      }

      // 2. Check the URI for WooCommerce specific API endpoints (Legacy and Store API)
      $request_uri = $_SERVER['REQUEST_URI'];
      $exclude_paths = [
        '/wp-json/',      // General REST API path
        '/wc-api/',       // Legacy WooCommerce API
        '/wc-auth/',      // WooCommerce Auth
      ];

      foreach ($exclude_paths as $path) {
        if (str_contains($request_uri, $path)) {
          return;
        }
      }

      // 3. If it's a normal visitor request, perform the redirect
      $new_domain = 'https://temp.com';
      $destination = $new_domain . $request_uri;

      wp_redirect($destination, 301);
      exit;
    }
  }
}
Theme::get_instance();
