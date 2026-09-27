<?php
namespace lasz_woocommerce;
use lasz_woocommerce\Config as Config;

// Reference: https://developer.wordpress.org/reference/classes/wp_customize_control

require_once(get_template_directory() . '/includes/classes/config.php');
require_once ABSPATH . 'wp-includes/class-wp-customize-control.php'; // You must require this file to access the classes within it. They have no namespace so a \ before the class name is required.

add_action('init', array('\lasz_woocommerce\Customize', 'get_instance'), 10);
Class Customize {
  private static $instance = null;

  public static function get_instance(){
      if (self::$instance == null){
          self::$instance = new self;
      }
      return self::$instance;
  }

  public function __construct() {
    add_action('customize_register', array(get_class($this), 'add_site'));
    add_action('customize_register', array(get_class($this), 'add_information'));
    add_action('customize_register', array(get_class($this), 'add_locations'));
    add_action('customize_register', array(get_class($this), 'add_social_media'));
  }

  public static function add_site($wp_customize) {
    // site page width
    $wp_customize->add_setting('site-page-width', array(
      'default' => '1440px',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_site_width', array(
      'label' => __('Max Page Width'),
      'section' => 'title_tagline',
      'settings' => 'site-page-width',
      'type' => 'text'
    )));

    // site logo
    $wp_customize->add_setting('site-logo', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Media_Control($wp_customize, 'theme_site_logo', array(
      'label' => __('Site Logo'),
      'section' => 'title_tagline',
      'settings' => 'site-logo'
    )));

    // show category nav
    // site page width
    $wp_customize->add_setting('site-show-cat-nav', array(
      'default' => true,
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_show_cat_nav', array(
      'label' => __('Show Categories in Top Navigation'),
      'section' => 'title_tagline',
      'settings' => 'site-show-cat-nav',
      'type' => 'checkbox'
    )));


    // site masthead background
    // $wp_customize->add_setting('site-masthead-background', array(
    //   'default' => '',
    //   'transport' => 'refresh'
    // ));

    // $wp_customize->add_control(new \WP_Customize_Media_Control($wp_customize, 'theme_site_masthead-background', array(
    //   'label' => __('Site Masthead'),
    //   'section' => 'title_tagline',
    //   'settings' => 'site-masthead-background'
    // )));

    // site colors
    $wp_customize->add_setting('site-color-primary', array(
      'default' => 'rgb(var(--kemet-color-violet-900))',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Color_Control($wp_customize, 'theme_color_primary', array(
      'label'     => __('Primary Color'),
      'section'   => 'title_tagline',
      'settings'  => 'site-color-primary',
    )));

    $wp_customize->add_control(new \WP_Customize_Color_Control($wp_customize, 'theme_color_background', array(
      'label'     => __('Background Color'),
      'section'   => 'title_tagline',
      'settings'  => 'site-color-background',
    )));

    $wp_customize->add_setting('site-color-footer', array(
      'default' => 'rgb(var(--kemet-color-white))',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Color_Control($wp_customize, 'theme_color_footer', array(
      'label'     => __('Footer Color'),
      'section'   => 'title_tagline',
      'settings'  => 'site-color-footer',
    )));
  }

  public static function add_information($wp_customize) {
    // sections
    $wp_customize->add_section('business-information', array(
      'title' => __('Business Information'),
      'description' => __('Information about the business.')
    ));

    // store hours
    $wp_customize->add_setting('business-hours-monday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_monday_hours', array(
      'label'     => __('Monday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-monday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-tuesday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_tuesday_hours', array(
      'label'     => __('Tuesday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-tuesday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-wednesday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_wednesday_hours', array(
      'label'     => __('Wednesday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-wednesday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-thursday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_thursday_hours', array(
      'label'     => __('Thursday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-thursday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-friday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_friday_hours', array(
      'label'     => __('Friday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-friday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-saturday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_saturday_hours', array(
      'label'     => __('Saturday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-saturday',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('business-hours-sunday', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_sunday_hours', array(
      'label'     => __('Sunday Hours'),
      'section'   => 'business-information',
      'settings'  => 'business-hours-sunday',
      'type'      =>  'text'
    )));

    // contact info
    $wp_customize->add_setting('headquarters-address', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_address', array(
      'label'     => __('Headquarters Address'),
      'section'   => 'business-information',
      'settings'  => 'headquarters-address',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('headquarters-address-link', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_address_link', array(
      'label'     => __('Headquarters Address Link'),
      'section'   => 'business-information',
      'settings'  => 'headquarters-address-link',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('primary-email', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_email', array(
      'label'     => __('Primary Email'),
      'section'   => 'business-information',
      'settings'  => 'primary-email',
      'type'      =>  'text'
    )));

    $wp_customize->add_setting('primary-phone', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_phone', array(
      'label'     => __('Primary Phone Number'),
      'section'   => 'business-information',
      'settings'  => 'primary-phone',
      'type'      =>  'text'
    )));
  }

  public static function add_locations($wp_customize) {
    if (!isset($wp_customize)) {
      return;
    }

    // number of locations
    $wp_customize->add_setting('business-location-number', array(
      'default' => '',
      'transport' => 'refresh'
    ));

    $wp_customize->add_control(new \WP_Customize_Control($wp_customize, 'theme_location_number', array(
      'label'     => __('Number of Locations'),
      'section'   => 'business-locations',
      'settings'  => 'business-location-number',
      'type'      =>  'number'
    )));

    $field = [];
    $section = new Section($wp_customize, 'business-locations', 'Business Locations', 25);
    $numOfLocations = get_theme_mod('business-location-number');

    for ($location = 0; $location < $numOfLocations; $location++) {
      $field[$locations] = new Field('business-location-'. $location, '', 'Location '. $location+1, Config::CUSTOMIZE['location_fields'], $location);
      $field[$locations]->add_to_section( $wp_customize, $section );
    }
  }

  public static function add_social_media($wp_customize) {
    if (!isset($wp_customize)) {
      return;
    }

    $fields = [
      array(
        'slug' => 'label',
        'label' => 'Label'
      ),
      array(
        'slug' => 'link',
        'label' => 'Link',
      ),
      array(
        'slug' => 'icon-footer',
        'label' => 'Footer Icon',
      )
    ];

    $sectionSlug = 'business-social-media';
    $socialMedia = Config::CUSTOMIZE['social_media'];

    $wp_customize->add_section($sectionSlug, array(
      'title' => __('Social Media'),
      'description' => __('Information about the business\'s Social Media'),
    ));

    foreach ($socialMedia as $media) {
      foreach ($fields as $field) {
        $label = __($media['label'] .' '. $field['label']);
        $controlSlug = 'theme-social-media-'. $field['slug'] .'-'. $media['slug'];
        $settingSlug = 'business-social-media-'. $field['slug'] .'-'. $media['slug'];

        $wp_customize->add_setting($settingSlug , array(
          'default' => '',
          'transport' => 'refresh'
        ));

        switch ($field['slug']) {
          case 'icon-footer' :
            $wp_customize->add_control(new \WP_Customize_Media_Control($wp_customize, $controlSlug, array(
              'label'     => $label,
              'section'   => $sectionSlug,
              'settings'  => $settingSlug,
            )));
            break;
          default :
            $wp_customize->add_control(new \WP_Customize_Control($wp_customize, $controlSlug, array(
              'label'     => $label,
              'section'   => $sectionSlug,
              'settings'  => $settingSlug,
              'type'      =>  'text'
            )));
        } // end switch
      } // end foreach field
    } // end foreach media
  }
}

if (class_exists('\WP_Customize_Control')) {
  class ControlBuilder extends \WP_Customize_Control {
    public $html = array();

    public function build_field_html($key, $setting, $fieldname) {
      $value = '';
      $uniqueKey = $fieldname .'-'. $key;
      if (isset($this->settings[$key])) {
        $value = $this->settings[$key]->value();
      }
      $this->html[] = '<p><label>'. $fieldname .'<input type="text" value="'.$value.'" '.$this->get_link($key).' /></label></p>';
    }

    public function render_content() {
      $output =  '<h3>' . $this->label .'</h3>';
      $fields = Config::CUSTOMIZE['location_fields'];
      echo $output;
      foreach ($this->settings as $key => $value) {
        $this->build_field_html($key, $value, $fields[$key]);
      }
      echo implode( '', $this->html );
    }
  }
}

class Section {
  public $name = '';
  public $pretty_name = '';

  public function __construct( \WP_Customize_Manager $wp_customize, $name, $pretty_name, $priority = 25 ) {
    $this->name = $name;
    $this->pretty_name = $pretty_name;

    $wp_customize->add_section( $this->getName(), array(
        'title'          => $pretty_name,
        'priority'       => $priority,
        'transport'      => 'refresh'
    ));
  }

  public function getName() {
    return $this->name;
  }

  public function getPrettyName() {
    return $this->pretty_name;
  }
}

class Field {
  private $name;
  private $default;
  private $pretty_name;
  private $fields;
  private $location;

  public function __construct($name, $default, $pretty_name, $fields, $location) {
    $this->name = $name;
    $this->default = $default;
    $this->pretty_name = $pretty_name;
    $this->fields = $fields;
    $this->location = $location;
  }

  public function add_to_section(\WP_Customize_Manager $wp_customize, $section) {
    $fields = [];

    foreach ($this->fields as $field) {
      $uniqueField = 'business-location-'. $field .'-'. $this->location;

      $wp_customize->add_setting($uniqueField, array(
        'default'        => $this->default,
        'type'           => 'theme_mod',
        'capability'     => 'edit_theme_options'
      ));

      $fields[] = $uniqueField;
    }

    $control = new ControlBuilder($wp_customize, $this->name, array(
      'label'    => $this->pretty_name,
      'section'  => $section->getName(),
      'settings' => $fields
    ));

    $wp_customize->add_control($control);
  }
}
