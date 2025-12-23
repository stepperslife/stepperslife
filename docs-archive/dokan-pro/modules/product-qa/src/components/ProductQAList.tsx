// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Filter, DataViews, DokanBadge, DokanModal } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import { DokanToaster, SearchableSelect, useToast } from '@getdokan/dokan-ui';
import { useCallback, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Question } from '../types';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import ProductFilter from './ProductFilter';
import { redirectToEditProduct } from '../utils';
import TableSkeleton from './TableSkeleton';

const defaultLayouts = {
    table: { density: 'comfortable' },
    list: {},
};
type ProductQAListProps = {
    navigate?: ( path: string ) => void;
};
export default function ProductQAList( { navigate }: ProductQAListProps ) {
    const currentUser = useSelect( ( select ) => {
        // @ts-ignore
        return select( 'dokan/core' ).getCurrentUser();
    }, [] );
    const toast = useToast();
    const [ questions, setQuestions ] = useState< Question[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ statusFilter, setStatusFilter ] = useState( null );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ isConfirm, setIsConfirm ] = useState( false );
    const [ selectedProduct, setSelectedProduct ] = useState( null );
    const [ selectedQuestion, setSelectedQuestion ] =
        useState< Question >( null );

    const navigateToQuestion = ( questionId: number ) => {
        if ( navigate ) {
            navigate( `/product-questions-answers/${ questionId }` );
        }
    };

    const fields = [
        {
            id: 'question',
            label: __( 'Question', 'dokan' ),
            render: ( { item }: { item: Question } ) => {
                return (
                    <div className="max-w-64 truncate">
                        { /* eslint-disable-next-line */ }
                        <div
                            role="button"
                            onClick={ () => {
                                navigateToQuestion( item.id );
                            } }
                            className="font-bold"
                        >
                            { item.question }
                        </div>
                        <small className="text-xs">
                            { __( 'by', 'dokan' ) } { item.user_display_name }
                        </small>
                    </div>
                );
            },
        },
        {
            id: 'product_id',
            label: __( 'Product', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <div className="max-w-64 truncate font-bold flex gap-2">
                        <img
                            src={ item.product.image }
                            alt={ item.product.title }
                            className="w-14 h-14 rounded object-cover flex-shrink-0"
                        />

                        <a href={ redirectToEditProduct( item.product.id ) }>
                            { item.product.title }
                        </a>
                    </div>
                );
            },
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan' ),
            render: ( { item } ) => {
                return (
                    <DokanBadge
                        variant={ item.answer?.answer ? 'success' : 'info' }
                        label={
                            item.answer?.answer
                                ? __( 'Answered', 'dokan' )
                                : __( 'Unanswered', 'dokan' )
                        }
                    />
                );
            },
        },
        {
            id: 'created_at',
            label: __( 'Date', 'dokan' ),
            render: ( { item } ) => {
                return item.created_at;
            },
        },
    ];

    const [ view, setView ] = useState( {
        page: 1,
        search: '',
        perPage: 10,
        type: 'table',
        titleField: 'id',
        layout: defaultLayouts,
        fields: fields.map( ( field ) =>
            field.id !== 'id' ? field.id : ''
        ),
    } );

    const actions = [
        {
            id: 'post-edit',
            label: () => {
                return (
                    <span className="dokan-link">
                        { __( 'View', 'dokan' ) }
                    </span>
                );
            },
            isPrimary: true,
            disabled: isLoading,
            callback: ( [ item ] ) => {
                navigateToQuestion( item.id );
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
            disabled: isLoading,
            callback: ( [ item ] ) => {
                setIsConfirm( true );
                setSelectedQuestion( item );
            },
        },
    ];

    const fetchQuestions = useCallback(
        async ( args = {} ) => {
            // Bail if we don’t have a valid user
            if ( ! currentUser?.id ) {
                return;
            }
            setIsLoading( true );
            try {
                const path = addQueryArgs( '/dokan/v1/product-questions', {
                    per_page: view.perPage,
                    vendor_id: currentUser.id,
                    page: view.page,
                    order: 'DESC',
                    ...args,
                } );
                const response = await apiFetch< any >( {
                    path,
                    parse: false,
                } );
                const data: Question[] = await response.json();
                setQuestions( data );
                const headers = response.headers;
                setTotalItems( headers.get( 'X-WP-Total' ) );
                setTotalPages( headers.get( 'X-WP-TotalPages' ) );
            } catch ( error ) {
                throw error;
            } finally {
                setIsLoading( false );
            }
        },
        [ currentUser.id, view.perPage, view.page ]
    );

    useEffect( () => {
        // eslint-disable-next-line
        fetchQuestions().catch(console.error);
    }, [ fetchQuestions ] );

    const handleFilter = async () => {
        // Handle filter logic
        const queryArgs = {
            page: 1,
            per_page: view.perPage,
            vendor_id: currentUser.id,
            answered: statusFilter?.value === 'answered',
        };
        await fetchQuestions( queryArgs );
    };

    const clearFilter = async () => {
        // Clear filter logic
        setStatusFilter( null );
        setSelectedProduct( null );
        await fetchQuestions();
    };

    const statusFilterHandler = async ( item ) => {
        // Handle status filter change
        setStatusFilter( item );
        await fetchQuestions( { answered: item.value === 'answered' } );
    };

    const productChangeHandler = async ( item ) => {
        // Handle product filter change
        setSelectedProduct( item );
        await fetchQuestions( { product_id: item.value } );
    };

    const deleteQuestionHandler = async () => {
        try {
            await apiFetch( {
                path: `/dokan/v1/product-questions/${ selectedQuestion.id }`,
                method: 'DELETE',
            } );
            setQuestions( ( prev ) =>
                prev.filter( ( q ) => q.id !== selectedQuestion.id )
            );
            toast( {
                type: 'success',
                title: __( 'Question deleted successfully', 'dokan' ),
            } );
        } catch ( error ) {
            // Handle error if needed
            toast( {
                type: 'error',
                title: __( 'Failed to delete question', 'dokan' ),
            } );
        }
    };

    return (
        <>
            <Filter
                fields={ [
                    <ProductFilter
                        selectProduct={ selectedProduct }
                        onChange={ productChangeHandler }
                        key="product-qa-by-prdouct"
                    />,
                    <SearchableSelect
                        className="z-50"
                        key="product-qa-by-status"
                        value={ statusFilter }
                        placeholder={ __( 'Select Status', 'dokan' ) }
                        onChange={ statusFilterHandler }
                        options={ [
                            {
                                label: __( 'Answered', 'dokan' ),
                                value: 'answered',
                            },
                            {
                                label: __( 'Unanswered', 'dokan' ),
                                value: 'unanswered',
                            },
                        ] }
                    />,
                ] }
                onFilter={ handleFilter }
                onReset={ clearFilter }
                showFilter={ true }
                showReset={ true }
                namespace="product-qa-list"
            />

            { isLoading ? (
                <TableSkeleton />
            ) : (
                <DataViews
                    view={ view }
                    data={ questions }
                    fields={ fields }
                    actions={ actions }
                    isLoading={ isLoading }
                    namespace="dokan-product-qa-data-view"
                    defaultLayouts={ defaultLayouts }
                    getItemId={ ( item ) => item.id }
                    onChangeView={ setView }
                    paginationInfo={ {
                        totalItems,
                        totalPages,
                    } }
                />
            ) }

            <DokanModal
                namespace="staff-delete"
                isOpen={ isConfirm }
                onClose={ () => setIsConfirm( false ) }
                dialogTitle={ __( 'Delete Question', 'dokan' ) }
                onConfirm={ deleteQuestionHandler }
                confirmationTitle={ __(
                    'Are you sure you want to delete this question?',
                    'dokan'
                ) }
                confirmationDescription={ __(
                    'This question will be permanently deleted.',
                    'dokan'
                ) }
            />
            <DokanToaster />
        </>
    );
}
