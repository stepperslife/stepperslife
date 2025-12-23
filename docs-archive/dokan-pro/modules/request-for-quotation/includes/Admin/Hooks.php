<?php

namespace WeDevs\DokanPro\Modules\RequestForQuotation\Admin;

defined( 'ABSPATH' ) || exit;

/**
 * Class for Hooks integration.
 *
 * @since 3.6.0
 */
class Hooks {

    /**
     * Class constructor
     *
     * @since 3.6.0
     *
     * @return void
     */
    public function __construct() {
        add_action( 'dokan_admin_menu', [ $this, 'add_admin_menu' ] );
        add_filter( 'dokan-admin-routes', [ $this, 'add_admin_route' ] );
    }

    /**
     * Add Dokan submenu
     *
     * @since 3.6.0
     *
     * @param string $capability
     *
     * @return void
     */
    public function add_admin_menu( $capability ) {
        if ( current_user_can( $capability ) ) {
            global $submenu;

            $title = esc_html__( 'RFQ', 'dokan' );
            $slug  = 'dokan';

            $submenu[$slug][] = [ $title, $capability, 'admin.php?page=' . $slug . '#/request-for-quote' ]; // phpcs:ignore
        }
    }

    /**
     * Add admin page Route
     *
     * @since 3.6.0
     *
     * @param array $routes
     *
     * @return array
     */
    public function add_admin_route( $routes ) {
        $routes[] = [
            'path'      => '/request-for-quote',
            'name'      => 'RequestAQuote',
            'component' => 'RequestAQuote',
        ];

        $routes[] = [
            'path'      => '/request-for-quote/new',
            'name'      => 'NewRequestQuote',
            'component' => 'NewRequestQuote',
        ];

        $routes[] = [
            'path'      => '/request-for-quote/:id/edit',
            'name'      => 'EditRequestQuote',
            'component' => 'NewRequestQuote',
        ];

        $routes[] = [
            'path'      => '/request-for-quote/quote-rules',
            'name'      => 'RequestAQuoteRules',
            'component' => 'RequestAQuoteRules',
        ];

        $routes[] = [
            'path'      => '/request-for-quote/quote-rules/new',
            'name'      => 'NewQuoteRules',
            'component' => 'NewQuoteRules',
        ];

        $routes[] = [
            'path'      => '/request-for-quote/quote-rule/:id/edit',
            'name'      => 'EditQuoteRules',
            'component' => 'NewQuoteRules',
        ];

        return $routes;
    }
}
