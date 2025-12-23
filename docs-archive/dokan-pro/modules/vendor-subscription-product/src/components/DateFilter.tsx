import { WpDatePicker } from '@dokan/components';
import { SimpleInput } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { dateI18n, getSettings } from '@wordpress/date';

const DateFilter = ( { filterArgs, setFilterArgs } ) => {
    return (
        <>
            <label htmlFor="dokan-filter-by-date-input">
                { __( 'Filter by Date', 'dokan' ) }
            </label>
            <WpDatePicker
                onChange={ ( date ) => {
                    setFilterArgs( ( prevData ) => {
                        return {
                            ...prevData,
                            selectedDate: date,
                        };
                    } );
                } }
                currentDate={
                    filterArgs?.selectedDate
                        ? filterArgs?.selectedDate
                        : new Date()
                }
            >
                <SimpleInput
                    // className="bg-white !h-[37px] "
                    onChange={ () => {} }
                    value={
                        filterArgs?.selectedDate
                            ? dateI18n(
                                  getSettings().formats.date,
                                  filterArgs?.selectedDate,
                                  getSettings().timezone.string
                              )
                            : ''
                    }
                    input={ {
                        id: 'dokan-filter-by-date-input',
                        name: 'dokan_filter_by_date_input',
                        type: 'text',
                        autoComplete: 'off',
                        placeholder: __( 'Enter Date', 'dokan' ),
                        required: true,
                    } }
                />
            </WpDatePicker>
        </>
    );
};

export default DateFilter;
