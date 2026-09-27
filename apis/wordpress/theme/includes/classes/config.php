<?php

namespace lasz_woocommerce;

class Config
{
  const POST_SUPPORT_TYPES = array(
    'page' => array('excerpt'),
  );

  const CUSTOMIZE = array(
    'location_fields' => ['name', 'address', 'address-link', 'email', 'phone'],
    'social_media' => [
      array('slug' => 'facebook', 'label' => 'Facebook'),
      array('slug' => 'x', 'label' => 'X'),
      array('slug' => 'instagram', 'label' => 'Instagram'),
      array('slug' => 'youtube', 'label' => 'YouTube'),
      array('slug' => 'linkedin', 'label' => 'LinkedIn'),
      array('slug' => 'nextdoor', 'label' => 'NextDoor'),
    ]
  );
}
