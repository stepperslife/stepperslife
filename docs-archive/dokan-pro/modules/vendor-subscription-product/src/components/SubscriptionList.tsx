import { useState, useEffect, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import '../../../../src/definitions/window-types';
import { useSubscriptionList } from '../hooks/SubscriptionListHooks';
import { getStatusTranslated, getStatusClass } from '../utils';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import {
    DataViews,
    Filter,
    DateTimeHtml,
    PriceHtml,
    CustomerFilter,
    DokanBadge,
    DokanTooltip as Tooltip,
} from '@dokan/components';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { snakeCase, truncate, formatPrice } from '@dokan/utilities';
import DateFilter from './DateFilter';
import { useCustomerById } from '@dokan/hooks';
import { twMerge } from 'tailwind-merge';
import { DokanToaster, useToast } from '@getdokan/dokan-ui';
import { Info } from 'lucide-react';

export default function SubscriptionList( props: any ) {
    const { navigate } = props;
    const queryParams = new URLSearchParams( props.location.search );
    const defaultLayouts = {
        table: { density: 'comfortable' },
        list: {},
    };

    const [ filterArgs, setFilterArgs ] = useState( {
        page: queryParams.get( 'page' ) || 1,
        per_page: queryParams.get( 'per_page' ) || 10,
        selectedDate: queryParams.get( 'order_date' ) || '',
        selectedCustomer: queryParams.get( 'customer_id' ) || '',
    } );

    const customerByIdHook = useCustomerById();
    const { data, totalItems, totalPages, isLoading, fetchList } =
        useSubscriptionList();

    const [ selectedCustomer, setSelectedCustomer ] = useState( {} );
    const toast = useToast();

    const fields = [
        {
            id: 'id',
            label: __( 'Subscription', 'dokan' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                        <strong
                            className="dokan-link cursor-pointer"
                            onClick={ () => {
                                navigate( `/user-subscription/${ item.id }` );
                            } }
                        >
                            #{ item.id }
                        </strong>
                    ) }
                </div>
            ),
            enableSorting: false,
        },
        {
            id: 'line_items',
            label: __( 'Item', 'dokan' ),
            render: ( { item } ) => {
                // eslint-disable-next-line camelcase
                const { line_items } = item;

                // eslint-disable-next-line camelcase,@typescript-eslint/no-shadow
                const LineItemsUI = line_items.map( ( item, index ) => {
                    const text = `${ index > 0 ? ', ' : '' }${ item.name } X ${item.quantity }`;
                    return (
                        <Tooltip
                            key={ index }
                            content={ <RawHTML>{ text }</RawHTML> }
                            direction="top"
                            contentClass={ twMerge(
                                '',
                                'bg-gray-800 text-white p-2 rounded-md'
                            ) }
                        >
                            <p
                                className="m-0 space-x-2 flex flex-wrap max-w-80 text-wrap leading-6"
                                key={ index }
                            >
                                { truncate(
                                    text,
                                    window.wp.hooks.applyFilters(
                                        'dokan-frontend-user-subscription-list-item-title-truncate-length',
                                        20
                                    )
                                ) }
                            </p>
                        </Tooltip>
                    );
                } );
                const Loader = (
                    <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                );

                return isLoading ? Loader : LineItemsUI;
            },
            enableSorting: false,
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <DokanBadge
                            label={ getStatusTranslated( item.status ) }
                            variant={ getStatusClass( item.status ) }
                        />
                    ) }
                </div>
            ),
            enableSorting: false,
        },
        {
            id: 'total',
            label: __( 'Total', 'dokan' ),
            render: ( { item } ) => {
                // eslint-disable-next-line camelcase,@typescript-eslint/no-shadow
                const { currency, payment_method_title, billing_period } = item;
                return (
                    <div>
                        { isLoading ? (
                            <span className="block w-40 h-3 rounded bg-gray-200 animate-pulse"></span>
                        ) : (
                            // eslint-disable-next-line react/jsx-no-comment-textnodes
                            <div className="flex">
                                <Tooltip
                                    content={
                                        <RawHTML>
                                            { `${ formatPrice(
                                                item.total ?? 0,
                                                window.dokanProductSubscription
                                                    .currencySymbols[ currency ]
                                            ) } / ${ billing_period } ${ __(
                                                'Via',
                                                'dokan'
                                            ) } ${ payment_method_title }` }
                                        </RawHTML>
                                    }
                                    direction="top"
                                    contentClass={ twMerge(
                                        '',
                                        'bg-gray-800 text-white p-2 rounded-md'
                                    ) }
                                >
                                    <div className="flex">
                                        <div>
                                            <PriceHtml
                                                price={ item.total }
                                                currencySymbol={
                                                    window.dokanProductSubscription
                                                        .currencySymbols[ currency ]
                                                }
                                            />
                                        </div>
                                        &nbsp;
                                        <Info size={16} className="mt-[2px]"/>
                                    </div>
                                </Tooltip>
                            </div>
                        ) }
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'start_date',
            label: __( 'Start', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <div>
                        { isLoading ? (
                            <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                        ) : (
                            <span>
                                { item?.display_start_date &&
                                item.start_date ? (
                                    item?.display_start_date
                                ) : (
                                    <DateTimeHtml.Date
                                        date={ item.start_date }
                                    />
                                ) }
                            </span>
                        ) }
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'next_payment_date',
            label: __( 'Next Payment', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <div>
                        { isLoading ? (
                            <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                        ) : (
                            <span>
                                { item?.display_next_payment_date &&
                                item.next_payment_date ? (
                                    item?.display_next_payment_date
                                ) : (
                                    <DateTimeHtml.Date
                                        date={ item.next_payment_date }
                                    />
                                ) }
                            </span>
                        ) }
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'end_date',
            label: __( 'End', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <div>
                        { isLoading ? (
                            <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                        ) : (
                            <span>
                                { item?.display_end_date && item.end_date ? (
                                    item?.display_end_date
                                ) : (
                                    <DateTimeHtml.Date date={ item.end_date } />
                                ) }
                            </span>
                        ) }
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    const [ view, setView ] = useState( {
        perPage: queryParams.get( 'per_page' ) || 10,
        page: queryParams.get( 'page' ) || 1,
        search: '',
        type: 'table',
        titleField: 'id',
        layout: { ...defaultLayouts },
        fields: fields.map( ( field ) =>
            field.id !== 'id' ? field.id : ''
        ),
    } );

    const actions = [
        {
            id: 'subscription-view',
            isPrimary: true,
            disabled: isLoading,
            callback: ( posts ) => {
                const row = posts[ 0 ];
                navigate( `/user-subscription/${ row.id }` );
            },
            label: () => (
                <span
                    className={ `px-2 bg-transparent font-medium text-dokan-link hover:text-dokan-link-hover pr-r text-sm` }
                >
                    { __( 'View', 'dokan' ) }
                </span>
            ),
        },
    ];

    const fallbackData = [];

    const onViewChange = ( newView ) => {
        setView( newView );

        setFilterArgs( ( prevState ) => {
            return {
                ...prevState,
                page: newView.page,
                per_page: newView.perPage,
                selectedDate: queryParams.get( 'order_date' ) || '',
                selectedCustomer: queryParams.get( 'customer_id' ) || '',
            };
        } );

        props.navigate( {
            pathname: props.location.pathname,
            search: props
                .createSearchParams( {
                    page: newView.page,
                    per_page: newView.perPage,
                    order_date: queryParams.get( 'order_date' ) || '',
                    customer_id: queryParams.get( 'customer_id' ) || '',
                } )
                .toString(),
        } );
    };

    const handleFilter = () => {
        setView( ( prevState ) => {
            return {
                ...prevState,
                page: args.page,
            };
        } );

        let args = {
            page: 1,
            per_page: 10,
        };

        // @ts-ignore
        if ( filterArgs?.selectedDate ) {
            args = {
                ...args,
                // @ts-ignore
                order_date: filterArgs?.selectedDate,
            };
        }

        // @ts-ignore
        if ( filterArgs?.selectedCustomer ) {
            args = {
                ...args,
                // @ts-ignore
                customer_id: filterArgs?.selectedCustomer,
            };
        }

        navigate( {
            pathname: props.location.pathname,
            search: props.createSearchParams( args ).toString(),
        } );
    };
    const clearFilter = () => {
        const args = {
            page: 1,
            per_page: 10,
        };

        // @ts-ignore
        setFilterArgs( args );
        setSelectedCustomer( {} );
        setView( ( prevState ) => {
            return {
                ...prevState,
                page: args.page,
                perPage: args.per_page,
            };
        } );

        navigate( {
            pathname: props.location.pathname,
            search: props.createSearchParams( args ).toString(),
        } );
    };

    const Customer = () => {
        return (
            <>
                <label htmlFor="dokan-filter-by-customer">
                    { __( 'Filter by Registered Customer', 'dokan' ) }
                </label>
                <CustomerFilter
                    id="dokan-filter-by-customer"
                    value={ selectedCustomer }
                    errors={ [] }
                    onChange={ ( selected: {
                        label: string;
                        value: string;
                    } ) => {
                        setSelectedCustomer( selected );
                        setFilterArgs( ( prevData ) => {
                            return {
                                ...prevData,
                                selectedCustomer: selected.value,
                            };
                        } );
                    } }
                    placeholder={ __( 'Search', 'dokan' ) }
                    className="pt-[2px]"
                />
            </>
        );
    }

    useEffect( () => {
        const fetchData = async () => {
            let page = queryParams.get( 'page' ) || 1;
            // eslint-disable-next-line camelcase
            let per_page = queryParams.get( 'per_page' ) || 10;
            page = Number( page );
            // eslint-disable-next-line camelcase
            per_page = Number( per_page );

            // eslint-disable-next-line camelcase
            const order_date = queryParams.get( 'order_date' ) || '';
            // eslint-disable-next-line camelcase
            const customer_id = queryParams.get( 'customer_id' ) || '';

            let requestArg = {
                page,
                // eslint-disable-next-line camelcase
                per_page,
            };

            // eslint-disable-next-line camelcase
            if ( order_date ) {
                requestArg = {
                    ...requestArg,
                    // @ts-ignore
                    after: window
                        .moment( order_date )
                        .subtract( 1, 'days' )
                        .toISOString(),
                    before: window.moment( order_date ).toISOString(),
                };
            }

            // eslint-disable-next-line camelcase
            if ( customer_id ) {
                requestArg = {
                    ...requestArg,
                    // @ts-ignore
                    // eslint-disable-next-line camelcase
                    customer: customer_id,
                };
            }

            setView( ( prevState ) => {
                return {
                    ...prevState,
                    page,
                    // @ts-ignore
                    // eslint-disable-next-line camelcase
                    perPage: per_page,
                };
            } );

            setFilterArgs( ( prevState ) => {
                return {
                    ...prevState,
                    page,
                    // eslint-disable-next-line camelcase
                    per_page,
                    // eslint-disable-next-line camelcase
                    selectedDate: order_date,
                    // eslint-disable-next-line camelcase
                    selectedCustomer: customer_id,
                };
            } );

            const hookName = snakeCase(
                'dokan_subscription_filter_request_param'
            );

            // Applying filters to request payload before sending to server
            // @ts-ignore
            const requestPayload = wp.hooks.applyFilters(
                hookName,
                requestArg
            );

            await fetchList( requestPayload );
        };

        fetchData();
    }, [ props.location.search ] );

    useEffect( () => {
        const customerId = queryParams.get( 'customer_id' ) || '';

        const fetchCustomer = async () => {
            // @ts-ignore
            if ( customerId && customerId !== '' && ! isNaN( customerId ) ) {
                try {
                    const customer = await customerByIdHook.fetchCustomerById(
                        Number( customerId )
                    );
                    setSelectedCustomer( {
                        label:
                            // @ts-ignore
                            customer.first_name + ' ' + customer.last_name,
                        value: customer.id,
                    } );
                } catch ( error ) {
                    console.error( 'Failed to fetch customer', error );
                    toast( {
                        title: __( 'Failed to fetch customer', 'dokan' ),
                        type: 'error',
                    } );
                }
            }
        };

        fetchCustomer();
    }, [] );

    return (
        <div className="dokan-react-user-subscription">
            <Filter
                fields={ [
                    <Customer key="dokan-filter-by-customer" />,
                    <DateFilter
                        key="date_filter"
                        filterArgs={ filterArgs }
                        setFilterArgs={ setFilterArgs }
                    />,
                ] }
                onFilter={ handleFilter }
                onReset={ clearFilter }
                showFilter={ true }
                showReset={ true }
                namespace="vendor_subscription"
            />

            <DataViews
                data={ data ?? fallbackData }
                namespace="dokan-vendor-subscription-data-view"
                defaultLayouts={ { ...defaultLayouts } }
                fields={ fields }
                getItemId={ ( item ) => item.id }
                onChangeView={ onViewChange }
                search={ false }
                paginationInfo={ {
                    totalItems,
                    totalPages,
                } }
                view={ view }
                actions={ actions }
                isLoading={ isLoading }
            />

            <DokanToaster />
        </div>
    );
}
