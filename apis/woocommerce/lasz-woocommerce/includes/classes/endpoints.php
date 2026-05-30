<?php

namespace lasz_woocommerce;

use WP_Error;
use WP_REST_Response;

class Endpoints
{
  public static function init()
  {
    add_action('rest_api_init', array(self::class, 'add_contact_form'));
    add_action('rest_api_init', array(self::class, 'add_user_registration'));
    add_action('rest_api_init', array(self::class, 'add_change_password'));

    add_action('rest_api_init', array(self::class, 'get_site_logo'));
    add_action('rest_api_init', array(self::class, 'get_blog_info'));

    add_action('rest_api_init', array(self::class, 'get_nav_header'));
    add_action('rest_api_init', array(self::class, 'get_nav_top'));
    add_action('rest_api_init', array(self::class, 'get_nav_legal'));
    add_action('rest_api_init', array(self::class, 'get_nav_useful_links'));
    add_action('rest_api_init', array(self::class, 'get_nav_categories'));

    add_action('rest_api_init', array(self::class, 'get_theme_mods'));
    add_action('rest_api_init', array(self::class, 'get_order_status'));
    add_action('rest_api_init', array(self::class, 'get_customer_data'));
    add_action('rest_api_init', array(self::class, 'get_payment_methods'));
    add_action('rest_api_init', array(self::class, 'delete_payment_method'));
    add_action('rest_api_init', array(self::class, 'get_customer_orders'));
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
          // Save first name and last name as user meta
          $first_name = $request->get_param('user_first_name');
          $last_name = $request->get_param('user_last_name');

          if ($first_name) {
            update_user_meta($userData, 'first_name', $first_name);
          }
          if ($last_name) {
            update_user_meta($userData, 'last_name', $last_name);
          }

          return array(
            'status' => 'ok',
            'message' => 'Successfully created ' . $request->get_param('user_name') . '.',
            'data' => array(
              'user_id' => $userData,
              'user_name' => $request->get_param('user_name'),
              'user_first_name' => $request->get_param('user_first_name'),
              'user_last_name' => $request->get_param('user_last_name'),
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

  public static function get_order_status() {
    register_rest_route('lasz-woocommerce/v1', 'orders/status', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $order_id = $request->get_param('order_id');
        $order = wc_get_order($order_id);

        if (!$order) {
          return new WP_REST_Response(array('message' => 'Order not found'), 404);
        }

        // Pull tracking information
        $tracking_info = array( 'number' => null, 'carrier' => null );
        $tracking_meta = $order->get_meta( '_wc_shipment_tracking_items' );

        if ( ! empty( $tracking_meta ) && is_array( $tracking_meta ) ) {
            $tracking_info = array(
                'number'  => isset($tracking_meta[0]['tracking_number']) ? $tracking_meta[0]['tracking_number'] : null,
                'carrier' => isset($tracking_meta[0]['tracking_provider']) ? $tracking_meta[0]['tracking_provider'] : null
            );
        }

        return new WP_REST_Response( array(
          'success'  => true,
          'status'   => $order->get_status(),
          'tracking' => $tracking_info,
        ), 200 );
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_customer_data() {
    register_rest_route('lasz-woocommerce/v1', 'customer/data', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $current_user_id = get_current_user_id();

        if (!$current_user_id) {
          return new WP_REST_Response(array('message' => 'User not authenticated'), 401);
        }

        $customer = new \WC_Customer($current_user_id);

        if (!$customer || !$customer->get_id()) {
          return new WP_REST_Response(array('message' => 'Customer not found'), 404);
        }

        return new WP_REST_Response(array(
          'id' => $customer->get_id(),
          'billing' => $customer->get_billing(),
          'shipping' => $customer->get_shipping(),
        ), 200);
      },
      'permission_callback' => function () {
        return is_user_logged_in();
      },
    ));
  }

  public static function get_payment_methods() {
    register_rest_route('lasz-woocommerce/v1', 'customer/payment-methods', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        // Check if WooCommerce is active
        if (!class_exists('WooCommerce')) {
          return new WP_REST_Response(array('message' => 'WooCommerce is not active'), 503);
        }

        $current_user_id = get_current_user_id();

        if (!$current_user_id) {
          return new WP_REST_Response(array('message' => 'User not authenticated'), 401);
        }

        // Get Stripe customer ID from user meta
        $stripe_customer_id = get_user_meta($current_user_id, '_stripe_customer_id', true);

        // Debug: Log what we find
        error_log('Payment Methods Debug - User ID: ' . $current_user_id);
        error_log('Payment Methods Debug - Stripe Customer ID: ' . ($stripe_customer_id ?: 'not found'));

        // Check if WC_Payment_Tokens class exists
        if (!class_exists('\WC_Payment_Tokens')) {
          error_log('Payment Methods Debug - WC_Payment_Tokens class does not exist');
          return new WP_REST_Response(array('payment_methods' => array()), 200);
        }

        // Try to get all payment tokens (not just stripe)
        try {
          $all_tokens = \WC_Payment_Tokens::get_customer_tokens($current_user_id);
          error_log('Payment Methods Debug - All tokens count: ' . count($all_tokens));

          // Get saved payment methods from WooCommerce (Stripe plugin stores them as tokens)
          $payment_methods = \WC_Payment_Tokens::get_customer_tokens($current_user_id, 'stripe');
          error_log('Payment Methods Debug - Stripe tokens count: ' . count($payment_methods));

          // If no stripe tokens, try 'wc_stripe' as gateway ID
          if (empty($payment_methods)) {
            $payment_methods = \WC_Payment_Tokens::get_customer_tokens($current_user_id, 'wc_stripe');
            error_log('Payment Methods Debug - WC Stripe tokens count: ' . count($payment_methods));
          }

          $formatted_methods = array();

          foreach ($payment_methods as $token) {
            $formatted_methods[] = array(
              'id' => $token->get_id(),
              'token' => $token->get_token(),
              'type' => $token->get_type(),
              'brand' => $token->get_card_type(),
              'last4' => $token->get_last4(),
              'expiry_month' => $token->get_expiry_month(),
              'expiry_year' => $token->get_expiry_year(),
              'is_default' => $token->is_default(),
            );
          }

          error_log('Payment Methods Debug - Formatted methods: ' . json_encode($formatted_methods));

          return new WP_REST_Response(array('payment_methods' => $formatted_methods), 200);
        } catch (Exception $e) {
          error_log('Payment Methods Debug - Exception: ' . $e->getMessage());
          return new WP_REST_Response(array('message' => 'Error fetching payment methods: ' . $e->getMessage()), 500);
        }
      },
      'permission_callback' => function () {
        return is_user_logged_in();
      },
    ));
  }

  public static function delete_payment_method() {
    register_rest_route('lasz-woocommerce/v1', 'customer/payment-methods/(?P<token_id>\d+)', array(
      'methods' => 'DELETE',
      'callback' => function ($request) {
        $current_user_id = get_current_user_id();

        if (!$current_user_id) {
          error_log('Delete Payment Method: User not authenticated');
          return new WP_REST_Response(array('message' => 'User not authenticated', 'debug' => 'No current user ID found'), 401);
        }

        $token_id = $request->get_param('token_id');
        error_log('Delete Payment Method - Token ID: ' . $token_id . ', User ID: ' . $current_user_id);

        if (!class_exists('\WC_Payment_Tokens')) {
          error_log('Delete Payment Method: WC_Payment_Tokens class not available');
          return new WP_REST_Response(array('message' => 'WooCommerce payment tokens not available', 'debug' => 'WC_Payment_Tokens class does not exist'), 503);
        }

        try {
          $token = \WC_Payment_Tokens::get($token_id);

          if (!$token) {
            error_log('Delete Payment Method: Token not found for ID ' . $token_id);
            return new WP_REST_Response(array('message' => 'Payment method not found', 'debug' => 'Token ID ' . $token_id . ' does not exist'), 404);
          }

          error_log('Delete Payment Method - Token found, User ID: ' . $token->get_user_id() . ', Type: ' . $token->get_type());

          // Verify the token belongs to the current user
          if ($token->get_user_id() != $current_user_id) {
            error_log('Delete Payment Method: Token user ID mismatch');
            return new WP_REST_Response(array('message' => 'Unauthorized', 'debug' => 'Token belongs to user ID ' . $token->get_user_id() . ', but current user is ' . $current_user_id), 403);
          }

          // Delete the token
          $result = $token->delete();
          error_log('Delete Payment Method - token->delete result: ' . ($result ? 'true' : 'false'));

          if ($result) {
            return new WP_REST_Response(array('message' => 'Payment method deleted successfully'), 200);
          } else {
            error_log('Delete Payment Method: token->delete returned false');
            return new WP_REST_Response(array('message' => 'Failed to delete payment method', 'debug' => 'token->delete() returned false for token ID ' . $token_id), 500);
          }
        } catch (Exception $e) {
          error_log('Delete Payment Method Exception: ' . $e->getMessage());
          return new WP_REST_Response(array('message' => 'Error deleting payment method', 'debug' => $e->getMessage()), 500);
        }
      },
      'permission_callback' => '__return_true',
    ));
  }

  public static function get_customer_orders() {
    register_rest_route('lasz-woocommerce/v1', 'customer/orders', array(
      'methods' => 'GET',
      'callback' => function ($request) {
        $current_user_id = get_current_user_id();

        if (!$current_user_id) {
          return new WP_REST_Response(array('message' => 'User not authenticated'), 401);
        }

        if (!class_exists('WooCommerce')) {
          return new WP_REST_Response(array('message' => 'WooCommerce is not active'), 503);
        }

        try {
          $args = array(
            'customer_id' => $current_user_id,
            'limit' => -1,
          );

          $orders = wc_get_orders($args);

          if (empty($orders)) {
            return new WP_REST_Response(array('orders' => array()), 200);
          }

          $formatted_orders = array();

          foreach ($orders as $order) {
            $formatted_orders[] = array(
              'id' => $order->get_id(),
              'number' => $order->get_order_number(),
              'status' => $order->get_status(),
              'date_created' => $order->get_date_created()->date('Y-m-d H:i:s'),
              'total' => $order->get_total(),
              'currency' => $order->get_currency(),
              'currency_symbol' => html_entity_decode(get_woocommerce_currency_symbol($order->get_currency())),
            );
          }

          return new WP_REST_Response(array('orders' => $formatted_orders), 200);
        } catch (Exception $e) {
          error_log('Get Customer Orders Error: ' . $e->getMessage());
          return new WP_REST_Response(array('message' => 'Error fetching orders: ' . $e->getMessage()), 500);
        }
      },
      'permission_callback' => '__return_true',
    ));
  }
}
Endpoints::init();
