interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export default function TableSkeleton( {
    rows = 5,
    columns = 5,
}: TableSkeletonProps ) {
    return (
        <div className="w-full">
            { /* Table Header Skeleton */ }
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                { Array.from( { length: columns } ).map( ( _, index ) => (
                    <div key={ `header-${ index }` } className="flex-1 px-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                ) ) }
            </div>

            { /* Table Rows Skeleton */ }
            { Array.from( { length: rows } ).map( ( _, rowIndex ) => (
                <div
                    key={ `row-${ rowIndex }` }
                    className="flex items-center justify-between p-4 border-b border-gray-100"
                >
                    { /* Question Column */ }
                    <div className="flex-1 px-2">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-20"></div>
                        </div>
                    </div>

                    { /* Product Column */ }
                    <div className="flex-1 px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-14 h-14 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                    </div>

                    { /* Status Column */ }
                    <div className="flex-1 px-2">
                        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                    </div>

                    { /* Date Column */ }
                    <div className="flex-1 px-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>

                    { /* Actions Column */ }
                    <div className="flex-1 px-2">
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                    </div>
                </div>
            ) ) }
        </div>
    );
}
