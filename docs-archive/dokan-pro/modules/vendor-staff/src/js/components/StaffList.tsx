import {
    DataViews,
    DokanModal,
    DokanLink,
    Forbidden,
    DokanButton,
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved
} from '@dokan/components';
import { Staff } from '../types';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useToast, DokanToaster } from '@getdokan/dokan-ui';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { usePermission } from '@dokan/hooks';

// Set the data view default layout. We can hide the preview by not passing the layout prop.
const defaultLayouts = {
    table: { density: 'comfortable' },
    grid: {},
    list: {},
};

const StaffList = ( { navigate } ) => {
    const toast = useToast();
    const isStaff = usePermission( 'vendor_staff' );
    // State and Selectors
    const [ staffs, setStaffs ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState( null );
    const [ isOpen, setIsOpen ] = useState( false );
    const [ selectedStaff, setSelectedStaff ] = useState( null );
    // pagination and search handler
    const [ totalPage, setTotalPage ] = useState( 0 );
    // Set for handle bulk selection.
    const [ selection, setSelection ] = useState( [] );

    // Define fields for handle the table columns.
    const fields = [
        {
            id: 'full_name',
            label: __( 'Name', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <DokanLink
                        as="div"
                        onClick={ () => {
                            navigate( `/staffs/update/${ item.ID }` );
                        } }
                        className="font-bold cursor-pointer"
                    >
                        { item.first_name } { item.last_name }
                    </DokanLink>
                );
            },
            enableSorting: true,
        },
        {
            id: 'email',
            label: __( 'Email', 'dokan' ),
            enableGlobalSearch: true,
            enableSorting: true,
            render: ( { item } ) => item.user_email,
        },
        {
            id: 'phone',
            label: __( 'Phone', 'dokan' ),
            enableGlobalSearch: true,
            render: ( { item } ) => item.phone,
        },
        {
            id: 'user_registered',
            label: __( 'Registered Date', 'dokan' ),
            enableGlobalSearch: true,
            render: ( { item } ) => item.user_registered,
        },
    ];

    // Define necessary actions for the table rows.
    const actions = [
        {
            id: 'staff-update',
            label: () => {
                return (
                    <span className="dokan-link">
                        { __( 'Edit', 'dokan' ) }
                    </span>
                );
            },
            isPrimary: true,
            callback: ( list: any ) => {
                const post = list[ 0 ];
                navigate( `/staffs/update/${ post.ID }` );
            },
        },
        {
            id: 'staff-manage',
            label: () => {
                return (
                    <span className="dokan-link">
                        { __( 'Manage', 'dokan' ) }
                    </span>
                );
            },
            isPrimary: true,
            callback: ( list: any ) => {
                const post = list[ 0 ];
                navigate( `/staffs/permissions/${ post.ID }` );
            },
        },
        {
            id: 'post-delete',
            label: () => {
                return (
                    <span className="text-dokan-danger hover:text-dokan-danger-hover">
                        { __( 'Delete', 'dokan' ) }
                    </span>
                );
            },
            isPrimary: true,
            callback: ( list: any ) => {
                const post = list[ 0 ];
                setSelectedStaff( post );
                setIsOpen( true );
            },
        },
    ];

    // We can handle the pagination, search, sort, layout, fields.
    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        titleField: 'user_nicename',
        layout: { ...defaultLayouts },
        fields: fields.map( ( field ) =>
            field.id !== 'post_id' ? field.id : ''
        ), // we can ignore the representing title field
    } );

    const fetchStaffList = async () => {
        setIsLoading( true );
        const queryArgs = {
            per_page: view.perPage || 10,
            page: view.page || 1,
            search: view.search,
            orderby: 'registered',
            order: 'desc',
        };
        // Set sorting arguments for the post-order by. Like: title, date, author etc.
        // @ts-ignore
        if ( !! view?.sort?.field ) {
            // @ts-ignore
            queryArgs.orderby = view?.sort?.field ?? 'registered';
        }

        // Set sorting arguments for the post-order. Like: asc, desc
        // @ts-ignore
        if ( !! view?.sort?.direction ) {
            // @ts-ignore
            queryArgs.order = view?.sort?.direction ?? 'desc';
        }
        // @ts-ignore
        const params = new URLSearchParams( queryArgs ).toString() || '';
        try {
            const url = `dokan/v1/vendor-staff?${ params }`;
            const response = await apiFetch( {
                path: url,
                method: 'GET',
                parse: false,
            } );
            // @ts-ignore
            const data = await response.json();
            setStaffs( data );
            // @ts-ignore
            setTotalPage( response.headers.get( 'X-WP-Total' ) );
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const deleteStaff = async ( id: string | number ) => {
        return await apiFetch( {
            path: `dokan/v1/vendor-staff/${ id }`,
            method: 'DELETE',
            data: { id, force: true },
        } );
    };

    const deleteStaffHandler = async () => {
        try {
            await deleteStaff( selectedStaff.ID );
            toast( {
                type: 'success',
                title: __( 'Staff deleted successfully', 'dokan' ),
            } );
            await fetchStaffList();
        } catch ( err ) {
            toast( {
                type: 'error',
                title: __( 'Failed to delete staff', 'dokan' ),
            } );
        }
    };

    // Load initial data
    useEffect( () => {
        // eslint-disable-next-line no-console
        fetchStaffList().catch( console.error );
        // @ts-ignore
    }, [ view?.sort?.direction, view.page, view.perPage ] );

    const NavigateToStaffList = () => (
        <DokanButton variant="primary" onClick={ () => navigate( '/staffs' ) }>
            { __( 'Back to List', 'dokan' ) }
        </DokanButton>
    );

    if ( isStaff ) {
        return <Forbidden navigateButton={ <NavigateToStaffList /> } />;
    }

    return (
        <div className="dokan-vendor-staff-list">
            { error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 rounded">
                    { error }
                </div>
            ) }

            <DataViews
                data={ staffs }
                namespace="staff-data-view"
                defaultLayouts={ { ...defaultLayouts } }
                fields={ fields }
                getItemId={ ( item: Staff ) => item.ID }
                onChangeView={ setView }
                paginationInfo={ {
                    // Set pagination information for the table.
                    totalItems: totalPage,
                    totalPages: Math.ceil( totalPage / view.perPage ),
                } }
                view={ view }
                selection={ selection }
                onChangeSelection={ setSelection }
                actions={ actions }
                isLoading={ isLoading }
            />

            <DokanModal
                namespace="staff-delete"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
                dialogTitle={ __( 'Delete Staff Member', 'dokan' ) }
                onConfirm={ deleteStaffHandler }
                confirmationTitle={ __(
                    'Are you sure you want to delete this staff member?',
                    'dokan'
                ) }
                confirmationDescription={ __(
                    'This action is permanent. Once deleted, the staff member’s profile, permissions, and associated records will be permanently removed.',
                    'dokan'
                ) }
            />
            <DokanToaster />
        </div>
    );
};

export default StaffList;
