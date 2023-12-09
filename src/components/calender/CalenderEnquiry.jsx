import React, { useState, useRef, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import it from 'date-fns/locale/it';
import 'react-datepicker/dist/react-datepicker.css';
import { max } from 'date-fns';

registerLocale('it', it);

const CustomDatePicker = ({
    selected,
    inputRef,
    minDate,
    maxDate,
    label,
    placeholder,
    handleChange,
    readOnly,
    setDatePickerOpen,
    isDateDisabled,
    setDeparture,
    persistDeparture,
    setArrival,
    persistArrival
}) => {
    const datePickerRef = useRef(null);

    const [minimumDate, setminimumDate] = useState(minDate);
    const [maximumDate, setmaximumDate] = useState(maxDate);
    useEffect(()=>{
        setDeparture(persistDeparture)
        setArrival(persistArrival)
    },[])

    useEffect(() => {
        setminimumDate(new Date(minDate));
        setmaximumDate(new Date(maxDate));
    }, [minDate, maxDate]);

    // useEffect(() => {
    //     if (inputRef && inputRef.current) {
    //         inputRef.current.addEventListener('focus', handleInputFocus);
    //     }

    //     return () => {
    //         if (inputRef && inputRef.current) {
    //             inputRef.current.removeEventListener('focus', handleInputFocus);
    //         }
    //     };
    // }, [inputRef]);

    const handleInputFocus = (e) => {
        e.target.blur();
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);

            try {
                document.activeElement.blur(); // Close the keyboard
            } catch (err) {
                console.log(err);
            }
        }
        if (!readOnly) {
            setDatePickerOpen(true);
        }
    };

    const handleDateChange = (date) => {
        handleChange(date);
    };

    const formatDate = (date) => {
        // Customize the date format as per your requirements
        const formattedDate = date.toISOString().split('T')[0];
        return formattedDate;
    };
    return (
        <div className="position-relative mt-2">
            <label className="__form-label" style={{ zIndex: 100, position: 'absolute', top: -5 }}>
                <span className="pe-0">{label}</span>*
            </label>
            <DatePicker
                onKeyDown={(e) => {
                    e.preventDefault();
                }}
                locale={'it'}
                className="form-control __form-control z-5"
                minDate={minimumDate}
                maxDate={maximumDate}
                selected={selected}
                excludeDates={isDateDisabled}
                onChange={(date) => {
                    handleDateChange(date);
                    setDatePickerOpen(false);
                }}
                onSelect={() => {
                    setDatePickerOpen(false);
                }}
                onFocus={handleInputFocus}
                dateFormat="dd-MM-yyyy" // Customize the date format as per your requirements
                // ref={datePickerRef}
                popperPlacement="bottom-start"
                onClickOutside={() => setDatePickerOpen(false)}
                withPortal
                placeholderText={placeholder}
                readOnly={readOnly}
            />
        </div>
    );
};

export default CustomDatePicker;
