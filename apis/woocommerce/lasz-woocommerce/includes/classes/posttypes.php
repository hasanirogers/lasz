<?php
namespace lasz_woocommerce;

Class PostTypes {
  public static function init() {
    add_action('init', array(self::class, 'add_hero'));
  }

  public static function add_hero() {
    $labels = array(
      'name'          => 'Hero', // Plural name
      'singular_name' => 'Hero'   // Singular name
    );

    $supports = array(
      'title',        // Post title
      'editor',       // Post content
      'thumbnail',    // Featured image
      'post-formats',
      'page-attributes',
      'custom-fields'
    );

    $rewrite = array(
      'slug' => 'hero',
      'with_front' => FALSE,
    );

    $args = array(
      'labels'              => $labels,
      'description'         => 'Hero on the homepage.', // Description
      'supports'            => $supports,
      'hierarchical'        => false, // Allows hierarchical categorization, if set to false, the Custom Post Type will behave like Post, else it will behave like Page
      'public'              => true,  // Makes the post type public
      'show_ui'             => true,  // Displays an interface for this post type
      'show_in_menu'        => true,  // Displays in the Admin Menu (the left panel)
      'show_in_nav_menus'   => false,  // Displays in Appearance -> Menus
      'show_in_admin_bar'   => true,  // Displays in the black admin bar
      'show_in_rest'        => true,  // Enable REST API
      'menu_position'       => 5,     // The position number in the left menu
      // 'menu_icon'        => get_template_directory_uri() . '/images/icons/slides.png',  // The URL for the icon used for this post type
      'can_export'          => true,  // Allows content export using Tools -> Export
      'has_archive'         => true,  // Enables post type archive (by month, date, or year)
      'exclude_from_search' => true, // Excludes posts of this type in the front-end search result page if set to true, include them if set to false
      'publicly_queryable'  => false,  // Allows queries to be performed on the front-end part if set to true
      'capability_type'     => 'page', // Allows read, edit, delete like “Post”
      'rewrite'             => $rewrite,
    );

    register_post_type('hero', $args);
  }
}
PostTypes::init();
