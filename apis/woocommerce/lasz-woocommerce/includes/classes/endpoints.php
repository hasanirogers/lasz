<?php

namespace lasz_woocommerce;

use WP_Error;
use WP_REST_Response;

class Endpoints
{
  public static function init()
  {
    // add_action('rest_api_init', array(self::class, 'add_contact_form'));
    // add_action('rest_api_init', array(self::class, 'add_user_registration'));
    // add_action('rest_api_init', array(self::class, 'add_profile_image'));
    // add_action('rest_api_init', array(self::class, 'add_media_upload'));
    // add_action('rest_api_init', array(self::class, 'add_media_delete'));
    // add_action('rest_api_init', array(self::class, 'add_change_password'));

    add_action('rest_api_init', array(self::class, 'get_site_logo'));
    add_action('rest_api_init', array(self::class, 'get_blog_info'));

    add_action('rest_api_init', array(self::class, 'get_nav_header'));
    add_action('rest_api_init', array(self::class, 'get_nav_top'));
    add_action('rest_api_init', array(self::class, 'get_nav_legal'));
    add_action('rest_api_init', array(self::class, 'get_nav_useful_links'));
    add_action('rest_api_init', array(self::class, 'get_nav_categories'));

    add_action('rest_api_init', array(self::class, 'get_theme_mods'));
  }

  public static function add_contact_form() {
  }

  public static function add_user_registration()
  {
    register_rest_route('lasz-woocommerce/v1', 'register', array(
      'methods' => 'POST',
      'callback' => function ($request) {
        // Reference: https://developer.wordpress.org/reference/classes/wp_rest_request/
        $userData = wp_create_user($request->get_param('user_name'), $request->get_param('user_pass'), $request->get_param('user_email'));

        if (is_int($userData)) {
          return array(
            'status' => 'ok',
            'message' => 'Successfully created ' . $request->get_param('user_name') . '.',
            'data' => array(
              'user_id' => $userData,
              'user_name' => $request->get_param('user_name'),
              'user_email' => $request->get_param('user_email'),
              'user_pass' => $request->get_param('user_pass'),
            )
          );
        } else {
          return array(
            'status' => 'error',
            'message' => 'There was a problem creating the user.',
            'data' => $userData
          );
        }
      },
      'permission_callback' => function () {
        return true;
      }
    ));
  }

  public static function add_profile_image()
  {
    register_rest_route('lasz-woocommerce/v1', 'profile-image', array(
      'methods' => 'POST',
      'callback' => function ($request) {
        $image_src = $request->get_param('image_src');
        $image_id = $request->get_param('image_id');
        $user_id = $request->get_param('user_id');
        $user = get_user_by('id', $user_id);

        if (empty($user)) {
          return new WP_Error('error', 'User does not exist', array('status' => 400));
        }

        if (empty($user)) {
          return new WP_Error('error', 'image source is empty', array('status' => 400));
        }

        update_user_meta($user_id, 'lasz_woocommerce_profile_image', $image_src);
        update_user_meta($user_id, 'lasz_woocommerce_profile_image_id', $image_id);

        return new WP_REST_Response(array(
          'status' => 'success',
          'user_id' => $user_id,
          'image_src' => $image_src,
          "message" => "Profile image uploaded successfully"
        ), 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function add_media_upload()
  {
    register_rest_route('lasz-woocommerce/v1', 'media-upload', array(
      'methods' => 'POST',
      'callback' => function ($request) {
        return get_class()::upload_file();
      }
    ));
  }

  public static function add_media_delete()
  {
    register_rest_route('lasz-woocommerce/v1', 'media-delete', array(
      'methods' => 'POST',
      'callback' => function ($request) {
        $user_id = $request->get_param('user_id');
        $image_id = $request->get_param('image_id');

        $media_post = get_post($image_id);

        if (empty($media_post)) {
          return new WP_Error('error', 'Could not find the media to delete.', array('status' => 400));
        }

        if (gettype($user_id) !== 'string') {
          return new WP_Error('error', 'User ID must be a present.', array('status' => 400));
        }

        if ($media_post->post_author !== $user_id) {
          return new WP_Error('error', 'User does not have permission to delete this image' . $media_post->post_author, array('status' => 403));
        }

        wp_delete_attachment($image_id, true);

        return new WP_REST_Response(array(
          'status' => 'success',
          "message" => "Media has been deleted."
        ), 200);
      }
    ));
  }

  public static function add_change_password()
  {
    register_rest_route('lasz-woocommerce/v1', 'change-password', array(
      'methods' => 'POST',
      'callback' => function ($request) {
        $user_id = $request->get_param('user_id');
        $user = get_user_by('id', $user_id);

        $current_password = $request->get_param('current_password');
        $new_password = $request->get_param('new_password');

        if (empty($user)) {
          return new WP_REST_Response(array(
            'status' => 'error',
            "message" => 'User does not exist'
          ), 400);
        }

        if (empty($current_password)) {
          return new WP_REST_Response(array(
            'status' => 'error',
            "message" => 'Please enter current password'
          ), 400);
        }

        if (empty($new_password)) {
          return new WP_REST_Response(array(
            'status' => 'error',
            "message" => 'Please enter new password'
          ), 400);
        }

        if (wp_check_password($current_password, $user->data->user_pass)) {
          wp_set_password($new_password, $user_id);
          return new WP_REST_Response(array(
            'status' => 'success',
            "message" => 'Password updated successfully'
          ), 200);
        } else {
          return new WP_REST_Response(array(
            'status' => 'error',
            "message" => 'Incorrect current password'
          ), 400);
        }
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function upload_file()
  {
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/media.php');
    //upload only images and files with the following extensions
    $file_extension_type = array('jpg', 'jpeg', 'jpe', 'gif', 'png', 'bmp', 'tiff', 'tif', 'ico', 'zip', 'pdf', 'docx');
    $file_extension = strtolower(pathinfo($_FILES['async-upload']['name'], PATHINFO_EXTENSION));
    if (!in_array($file_extension, $file_extension_type)) {
      return wp_send_json(
        array(
          'success' => false,
          'data'    => array(
            'message'  => __('The uploaded file is not a valid file. Please try again.'),
            'filename' => esc_html($_FILES['async-upload']['name']),
            'extension' => $file_extension
          ),
        )
      );
    }

    $attachment_id = media_handle_upload('async-upload', null, []);

    if (is_wp_error($attachment_id)) {
      return wp_send_json(
        array(
          'success' => false,
          'data'    => array(
            'message'  => $attachment_id->get_error_message(),
            'filename' => esc_html($_FILES['async-upload']['name']),
          ),
        )
      );
    }

    if (isset($post_data['context']) && isset($post_data['theme'])) {
      if ('custom-background' === $post_data['context']) {
        update_post_meta($attachment_id, '_wp_attachment_is_custom_background', $post_data['theme']);
      }

      if ('custom-header' === $post_data['context']) {
        update_post_meta($attachment_id, '_wp_attachment_is_custom_header', $post_data['theme']);
      }
    }

    $attachment = wp_prepare_attachment_for_js($attachment_id);
    if (!$attachment) {
      return wp_send_json(
        array(
          'success' => false,
          'data'    => array(
            'message'  => __('Image cannot be uploaded.'),
            'filename' => esc_html($_FILES['async-upload']['name']),
          ),
        )
      );
    }

    return wp_send_json(
      array(
        'success' => true,
        'data'    => $attachment,
      )
    );
  }

  public static function get_site_logo() {
    register_rest_route('lasz-woocommerce/v1', 'site_logo', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $siteLogoID = get_theme_mod('site-logo');
        $siteLogoUrlFull = null;
        if ($siteLogoID) {
          $siteLogoUrlFull = wp_get_attachment_image_url($siteLogoID, 'full');
        }
        return new WP_REST_Response(array(
          'site_logo_full' => $siteLogoUrlFull,
        ), 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_blog_info() {
    register_rest_route('lasz-woocommerce/v1', 'bloginfo', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $name = get_bloginfo('name');
        $description = get_bloginfo('description');
        return new WP_REST_Response(array(
          'name' => $name,
          'description' => $description,
        ), 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_nav_header() {
    register_rest_route('lasz-woocommerce/v1', 'nav/header', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $top_nav = \wp_get_nav_menu_items('header');
        $menu_items = array();

        if ($top_nav === false || empty($top_nav)) {
          return new WP_REST_Response($menu_items, 200);
        }

        foreach ($top_nav as $item) {
          $menu_items[] = array(
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_order' => $item->menu_order,
            'parent' => $item->menu_item_parent,
            'type' => $item->type,
            'object' => $item->object,
            'object_id' => $item->object_id
          );
        }

        return new WP_REST_Response($menu_items, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_nav_top() {
    register_rest_route('lasz-woocommerce/v1', 'nav/top', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $top_nav = \wp_get_nav_menu_items('top');
        $menu_items = array();

        if ($top_nav === false || empty($top_nav)) {
          return new WP_REST_Response($menu_items, 200);
        }

        foreach ($top_nav as $item) {
          $menu_items[] = array(
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_order' => $item->menu_order,
            'parent' => $item->menu_item_parent,
            'type' => $item->type,
            'object' => $item->object,
            'object_id' => $item->object_id
          );
        }

        return new WP_REST_Response($menu_items, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_nav_legal() {
    register_rest_route('lasz-woocommerce/v1', 'nav/legal', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $legal_nav = \wp_get_nav_menu_items('legal');
        $menu_items = array();

        if ($legal_nav === false || empty($legal_nav)) {
          return new WP_REST_Response($menu_items, 200);
        }

        foreach ($legal_nav as $item) {
          $menu_items[] = array(
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_order' => $item->menu_order,
            'parent' => $item->menu_item_parent,
            'type' => $item->type,
            'object' => $item->object,
            'object_id' => $item->object_id
          );
        }

        return new WP_REST_Response($menu_items, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_nav_useful_links() {
    register_rest_route('lasz-woocommerce/v1', 'nav/useful-links', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $nav = \wp_get_nav_menu_items('useful-links');
        $menu_items = array();

        if ($nav === false || empty($nav)) {
          return new WP_REST_Response($menu_items, 200);
        }

        foreach ($nav as $item) {
          $menu_items[] = array(
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_order' => $item->menu_order,
            'parent' => $item->menu_item_parent,
            'type' => $item->type,
            'object' => $item->object,
            'object_id' => $item->object_id
          );
        }

        return new WP_REST_Response($menu_items, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_nav_categories() {
    register_rest_route('lasz-woocommerce/v1', 'nav/categories', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $productCatArgs = array(
          'taxonomy' => 'product_cat',
          'orderby' => 'name',
          'order' => 'ASC',
          'hide_empty' => false
        );

        $categories = get_categories($productCatArgs);
        $menu_items = array();

        if ($categories === false || empty($categories)) {
          return new WP_REST_Response($menu_items, 200);
        }

        foreach ($categories as $category) {
          if ($category->slug !== 'uncategorized') {
            $thumbnailID = get_term_meta($category->term_id, 'thumbnail_id', true);
            $thumbnailSRC = wp_get_attachment_url($thumbnailID);

            $menu_items[] = array(
              'id' => $category->term_id,
              'name' => $category->name,
              'slug' => $category->slug,
              'thumbnail' => $thumbnailSRC,
              'description' => $category->description,
              'url' => '/product-category/' . $category->slug
            );
          }
        }

        return new WP_REST_Response($menu_items, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_theme_mods() {
    register_rest_route('lasz-woocommerce/v1', 'theme/mods', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $theme_mods = get_theme_mods();

        if (!$theme_mods) {
          return new WP_REST_Response(array(), 200);
        }

        return new WP_REST_Response($theme_mods, 200);
      },
      'permission_callback' => '__return_true',
    ));
  }
}
Endpoints::init();
