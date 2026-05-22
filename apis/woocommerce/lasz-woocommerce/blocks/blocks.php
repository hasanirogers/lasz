<?php
/**
 * Plugin Name:       Business Blocks
 * Description:       A collection of blocks for businesses by Deific Arts, LLC.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Deific Arts, LLC
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package           business-blocks
 */

function create_business_block_init() {
	$directory = new DirectoryIterator(get_template_directory() . '/build');

	foreach ($directory as $fileinfo) {
		if (!$fileinfo->isDot() && $fileinfo->isDir()) {
			register_block_type( get_template_directory() . '/build/' . $fileinfo->getFilename());
		}
	}
}
add_action( 'init', 'create_business_block_init' );
