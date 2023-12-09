import React, { createRef, useEffect, useRef, useState } from "react";
import { Plus2, Send } from "./Icon";
import Input from "./Input";
import Room from "./Room";

import loading from "../assets/img/dualLoading.gif";
import CustomDatePicker from "./calender/CalenderEnquiry";
import { europeanCountries, getAllCities } from "./Cities";
import Input1 from "./Input1";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const formatDate = (ogDate) => {
  let date = new Date(ogDate);

  // Get the individual components of the date
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  let day = String(date.getDate()).padStart(2, "0");

  // Format the date as YYYY-MM-DD
  let formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

function calculateDaysAndNights(startDate, endDate) {
  // Convert the dates to milliseconds
  const startMillis = new Date(startDate).getTime();
  const endMillis = new Date(endDate).getTime();

  // Calculate the time difference in milliseconds
  const timeDiffMillis = endMillis - startMillis;

  var numberOfNights = Math.ceil(timeDiffMillis / (1000 * 3600 * 24));

  // Calculate the number of days
  const days = Math.floor(timeDiffMillis / (1000 * 60 * 60 * 24));

  return { days, nights: numberOfNights };
}

const checkDateValidity = (offer, checkInDate, checkOutDate) => {
  const minNights = parseInt(offer["minimo notti"]);
  const maxNights = parseInt(offer["massimo notti"]);

  const checkInDateFromRecord = new Date(offer["Valida dal"]);
  const checkOutDateFromRecord = new Date(offer["Valida al"]);

  const checkInDateFromQuery = new Date(checkInDate);
  const checkOutDateFromQuery = new Date(checkOutDate);

  const { nights } = calculateDaysAndNights(
    checkInDateFromQuery,
    checkOutDateFromQuery
  );
  const dateBeforeMinNights = new Date(checkOutDateFromQuery);
  dateBeforeMinNights.setDate(dateBeforeMinNights.getDate() - minNights);

  if (
    checkInDateFromQuery >= checkInDateFromRecord &&
    checkInDateFromQuery <= dateBeforeMinNights
  ) {
    if (nights === minNights || (nights >= minNights && nights <= maxNights)) {
      return true;
    }
  }

  return false;
};

const ViewInquiryForm = (
  {
    offer,
    Hotel,
    NomeModulo,
    totalPriceForUser,
    checkInDate,
    checkOutDate,
    setUserData,
    userData,
    sending,
    setvalue,
    value,
    handleSubmit,
    buttonDisabled,
    handleUpdateRooms,
    setDatePickerOpen,
    selectItems,
    selectedPackage,
    breakdownNames,
    setSelectedPackage,
    handleOfferClose,
    departure,
    setDeparture,
    persistDate,
    setPersistDate,
    idx,
    arrival,
    setArrival,
    persistArrival,
    setPersistArrival,
    readOnly,
    setReadOnly,
    persistReadOnly,
    setPersistReadOnly,
    readOnlyArrival,
    setReadOnlyArrival,
    persistReadOnlyArrival,
    setPersistReadOnlyArrival
  },
  ref
) => {
  const [dateValid, setDateValid] = useState(
    checkDateValidity(offer, checkInDate, checkOutDate)
  );
  const cityInput = useRef()

  const [maxDepartureDate, setMaxDepatureDate] = useState("");
  const [minDepartureDate, setMinDepartureDate] = useState("");
  const [minArrivalDate, setMinArrivalDate] = useState("");
  const [maxArrivalDate, setMaxArrivalDate] = useState("");

  // const [arrival, setArrival] = useState("");
  // const [departure, setDeparture] = useState("");

  const [prevDateValid, setPrevDateValid] = useState(false);

  const [clicked, setClicked] = useState(false);

  function calculateInitialMinAndMaxDates(offer) {
    const minNights = parseInt(offer["minimo notti"]);
    // const maxNights = parseInt(offer['massimo notti']);

    const checkInDateFromRecord = new Date(offer["Valida dal"]);
    const checkOutDateFromRecord = new Date(offer["Valida al"]);

    // for departure
    const minimumDeparture = checkInDateFromRecord;

    const maximumDeparture = checkOutDateFromRecord;
    maximumDeparture.setDate(maximumDeparture.getDate() - minNights);

    setMaxDepatureDate(maximumDeparture);

    setMinDepartureDate(new Date(offer["Valida dal"]));

    // for arrival

    const minimumArrival = checkInDateFromRecord;
    minimumArrival.setDate(minimumArrival.getDate() + minNights);

    const maximumArrival = new Date(offer["Valida al"]);

    setMaxArrivalDate(maximumArrival);

    setMinArrivalDate(minimumArrival);
  }

  useEffect(()=>{
    localStorage.setItem("offer",offer.id)
    localStorage.setItem("hotel",Hotel.id)
  },[offer,Hotel])

  useEffect(() => {
    setDateValid(checkDateValidity(offer, checkInDate, checkOutDate));
    // if (arrival && departure) {
    //     const validity = checkDateValidity(offer, departure, arrival);
    //     setPrevDateValid(validity);
    // }

    // setPersistReadOnly({...persistReadOnly,0:true})
    // setReadOnly()

  }, [
    offer["Nome Offerta"],
    offer["Valida dal"],
    checkInDate,
    checkOutDate,
    NomeModulo,
    Hotel,
  ]);


  const disabledDates = [];
  let x = 0;

  for (let i = new Date(offer.startDate) >= new Date() ? new Date(offer.startDate) : new Date(); i <= new Date(offer.endDate); i.setDate(i.getDate() + 1)) {
    const currentDate = new Date(i) + 1;
    if(offer.minStay==offer.maxStay){
      if (x % offer.minStay !== 0) {
        disabledDates.push(new Date(currentDate));
      } else {
        x = 0;
      }
    }
    x++;
  }
  useEffect(() => {
    calculateInitialMinAndMaxDates(offer, checkInDate, checkOutDate);

    let { nights } = calculateDaysAndNights(
      offer["Valida dal"],
      offer["Valida al"]
    );
    const minNights = parseInt(offer["minimo notti"]);

    const equal = nights === minNights;

    setReadOnly(equal);

    setArrival(
      equal
        ? new Date(offer["Valida al"])
        : dateValid
          ? new Date(checkOutDate)
          : ""
    );
    setDeparture(
      equal
        ? new Date(offer["Valida dal"])
        : dateValid
          ? new Date(checkInDate)
          : ""
    );
  }, [
    offer["Nome Offerta"],
    offer["Valida dal"],
    checkInDate,
    checkOutDate,
    dateValid,
  ]);

  useEffect(()=>{
    userData.Citta = null;
    userData.bags=null;
    userData.carSize=null;
  },[value])

  const handleDepartureChange = (value) => {
    const departureDateFromForm = new Date(value);
    const minNights = parseInt(offer["minimo notti"]);

    const minArrivalDateCalc = departureDateFromForm.setDate(
      departureDateFromForm.getDate() + minNights
    );

    setMinArrivalDate(minArrivalDateCalc);
  };

  const handleArrivalChange = (value) => {
    const arrivalDateFromForm = new Date(value);
    const minNights = parseInt(offer["minimo notti"]);

    const maxDepartureDateCalc = arrivalDateFromForm.setDate(
      arrivalDateFromForm.getDate() - minNights
    );

    setMaxDepatureDate(maxDepartureDateCalc);
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const departureRef = createRef(null);

  const arrivalRef = createRef(null);

  useEffect(()=>{
    const prevInDate = localStorage.getItem("prevInDate");
    const prevOutDate = localStorage.getItem("prevOutDate");
    var prevInBool = true;
    var prevOutBool = true;
    for(let j=0;j<=disabledDates.length;j++){
      if(new Date(disabledDates[j]).toDateString()==new Date(prevInDate).toDateString()){
        prevInBool = false;
      }
      if(new Date(disabledDates[j]).toDateString()==new Date(prevOutDate).toDateString()){
        prevOutBool = false;
      }
    }
    const calStart = new Date(offer.startDate) >= new Date() ? new Date(offer.startDate) : new Date(new Date() + 1);
    const calEnd = new Date(offer.endDate);
    calStart.setHours(0, 0, 0, 0);
    calEnd.setHours(0, 0, 0, 0);

    if(new Date(prevInDate)>new Date(calEnd) || new Date(prevInDate)<new Date(calStart)){
      prevInBool = false;
    }
    if(new Date(prevOutDate)>new Date(calEnd) || new Date(prevOutDate)<new Date(calStart)){
      prevOutBool = false;
    }
    if(offer.minStay == offer.maxStay && new Date(new Date(offer.startDate).getTime() + offer.minStay * 24 * 60 * 60 * 1000).toDateString() == new Date(offer.endDate).toDateString()){
      let persistReadOnlyNew = {...persistReadOnly}
      persistReadOnlyNew[idx]=true;
      setPersistReadOnly(persistReadOnlyNew)
      setReadOnly(persistReadOnlyNew[idx])

      let persistDateNew = {...persistDate}
      persistDateNew[idx]=new Date(offer.startDate);
      setPersistDate(persistDateNew)
      setDeparture(persistDateNew[idx])

      let persistArrivalNew = {...persistArrival}
      persistArrivalNew[idx]=new Date(offer.endDate);
      setPersistArrival(persistArrivalNew)
      setArrival(persistArrivalNew[idx])

      let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
        persistReadOnlyNewArrival[idx]=true;
        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
    }
    else if(new Date(offer.startDate).toDateString()==new Date(checkInDate).toDateString() && new Date(offer.endDate).toDateString()==new Date(checkOutDate).toDateString()){
      let persistReadOnlyNew = {...persistReadOnly}
      persistReadOnlyNew[idx]=false;
      setPersistReadOnly(persistReadOnlyNew)
      setReadOnly(persistReadOnlyNew[idx])

      let persistDateNew = {...persistDate}
      persistDateNew[idx]=new Date(offer.startDate);
      setPersistDate(persistDateNew)
      setDeparture(persistDateNew[idx])

      let persistArrivalNew = {...persistArrival}
      persistArrivalNew[idx]=new Date(offer.endDate);
      setPersistArrival(persistArrivalNew)
      setArrival(persistArrivalNew[idx])

      let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
        persistReadOnlyNewArrival[idx]=true;
        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
    }
    else if(new Date(offer.endDate).toDateString() == new Date(new Date() + 1 + offer.minStay).toDateString()){
      let persistReadOnlyNew = {...persistReadOnly}
      persistReadOnlyNew[idx]=true;
      setPersistReadOnly(persistReadOnlyNew)
      setReadOnly(persistReadOnlyNew[idx])

      let persistDateNew = {...persistDate}
      persistDateNew[idx]=new Date(new Date(offer.endDate) - offer.minStay);
      setPersistDate(persistDateNew)
      setDeparture(persistDateNew[idx])

      let persistArrivalNew = {...persistArrival}
      persistArrivalNew[idx]=new Date(offer.endDate);
      setPersistArrival(persistArrivalNew)
      setArrival(persistArrivalNew[idx])

      let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
        persistReadOnlyNewArrival[idx]=true;
        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
    }
    else if (prevInBool && prevOutBool){
      let persistReadOnlyNew = {...persistReadOnly}
      persistReadOnlyNew[idx]=false;
      setPersistReadOnly(persistReadOnlyNew)
      setReadOnly(persistReadOnlyNew[idx])

      let persistDateNew = {...persistDate}
      persistDateNew[idx]=new Date(prevInDate);
      setPersistDate(persistDateNew)
      setDeparture(persistDateNew[idx])

      let persistArrivalNew = {...persistArrival}
      persistArrivalNew[idx]=new Date(prevOutDate);
      setPersistArrival(persistArrivalNew)
      setArrival(persistArrivalNew[idx])

      let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
        persistReadOnlyNewArrival[idx]=false;
        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
    }
    else{
      let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
        persistReadOnlyNewArrival[idx]=true;
        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
    }
    localStorage.setItem("selectedPackage","Pensione completa")
  },[idx])
  const handleAddRoom = () => {
    setUserData({
      ...userData,
      rooms: [...userData.rooms, { adult: 2, child: 0, childAge: [] }],
    });
  };

  const removeRoom = (idx) => {
    const updatedRooms = userData.rooms.filter((room, i) => i !== idx);

    setUserData(() => ({ ...userData, rooms: updatedRooms }));
  };

  const optionRef = useRef(null);

  const handleScroll = () => {
    optionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const {isLoaded} = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBen1zTUuynCgRfIStX1NqhEp_eHat4n0k',
    libraries: ['places']
  })

  const handleInputChange = async (event) => {
    const inputValue = event.target.value;
    setCity(inputValue);
    const apiKey = 'AIzaSyBen1zTUuynCgRfIStX1NqhEp_eHat4n0k'; // Replace with your SwiftComplete API key

    
    // const europeanCountries = [
    //   'al', 'ad', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu',
    //   'is', 'ie', 'it', 'kosovo', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md', 'mc', 'me', 'nl', 'no', 'pl', 'pt',
    //   'ro', 'ru', 'sm', 'rs', 'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va'
    // ];

    // const europeanCountriesString = europeanCountries.join(',');

    // const url = `https://api.swiftcomplete.com/v1/places/?key=${apiKey}&countries=${europeanCountriesString}&text=${inputValue}&maxResults=5`;

    //  fetch(url)
    //   .then((response) => response.json())
    //   .then(async(data) => {
    //     // Extract suggestions from the API response
    //     const citySuggestions = data.map((result) => result.type.includes("place.settlement") ? result.primary.text : null);
    //     const translatedCityPromises = citySuggestions.map(async (cityName) => {
    //       const translationResponse = await fetch(
    //         `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=it&dt=t&q=${encodeURIComponent(
    //           cityName
    //         )}`
    //       );
    //         if(cityName){
    //           const translatedCityName = await translationResponse.json();
    //           return translatedCityName[0][0][0]; // Extract the translated city name

    //         }
    //         else{
    //           return null;
    //         }
    //     });

    //     // Wait for all translations to complete before setting the state
    //     const translatedCityNames = await Promise.all(translatedCityPromises);
    //     const displayArr = translatedCityNames.filter((item,index) => translatedCityNames.indexOf(item) === index);
    //     setSuggestions(displayArr);
    //     // Now you can use citySuggestions in your application.
    //   })
    //   .catch((error) => console.error('Error fetching city suggestions:', error));

    
  };

    function calculateSelectableCheckInDates() {
      const selectableCheckInDates = [];
      let currentDateIterator = new Date(offer.startDate);

      while (currentDateIterator < new Date(new Date(offer.endDate).getTime() - (offer.maxStay * 24 * 60 * 60 * 1000))) {
        if (currentDateIterator > Date()) {
          selectableCheckInDates.push(new Date(currentDateIterator));
        }
        currentDateIterator.setDate(currentDateIterator.getDate() + offer.minStay);
      }

      return selectableCheckInDates;
    }
const getHighlightDates = (dates) => {
  const highlight = {};
  dates.forEach(date => {
    highlight[date] = 'non-selectable'; // 'non-selectable' will add a class to disable these dates
  });
  return highlight;
};
const val = calculateSelectableCheckInDates();
// function calculateSelectableCheckOutDates(selectedCheckInDate) {
//   const selectableCheckOutDates = [];
//   let currentCheckOutDate = new Date(selectedCheckInDate);

//   while (currentCheckOutDate < new Date(offer.endDate)) {
//     selectableCheckOutDates.push(new Date(currentCheckOutDate));
//     currentCheckOutDate.setDate(new Date(currentCheckOutDate).getDate() + offer.minStay);
//   }

//   return selectableCheckOutDates;
// }
return (
  <>
    {userData ? (
      <>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clicked) {
              setClicked(true);
              setTimeout(() => {
                handleSubmit(
                  formatDate(arrival),
                  formatDate(departure),
                  NomeModulo,
                  Hotel,
                  totalPriceForUser,
                  selectedPackage.text,
                  handleScroll,
                  handleOfferClose
                );
                setClicked(false);
              }, 1000);
            }
          }}
          className="inquiry--form"
        >
          <div className="row g-3">
            <div className="col-sm-6 col-md-3">
              <Input
                required={true}
                type="text"
                value={userData.Nome}
                name="Nome"
                handleChange={handleChange}
                label="Nome"
                placeholder="Il tuo nome"
              />
            </div>
            <div className="col-sm-6 col-md-3 relative">
              <div>
                <Input
                  required={true}
                  type="text"
                  name="Cognome"
                  value={userData.Cognome}
                  handleChange={handleChange}
                  label="Cognome"
                  placeholder="Il tuo cognome"
                />
              </div>
            </div>
            <div className="col-sm-6 col-md-3">
              <Input
                required
                type="email"
                label="E-mail "
                value={userData.Email}
                handleChange={handleChange}
                name="Email"
                placeholder="La tua email"
              />
            </div>
            <div className="col-sm-6 col-md-3">
              <Input
                required
                label="Numero di Telefono"
                type="tel"
                value={userData.Phone}
                handleChange={handleChange}
                name="Phone"
                placeholder="1234567890"
              />
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2 relative">
              {/* <div className="">
                                    <Input
                                        handleChange={(e) => {
                                            setDeparture(e.target.value);
                                            handleDepartureChange(e);
                                        }}
                                        value={departure}
                                        name="departure"
                                        // min={minDepartureDate}
                                        // max={maxDepartureDate}
                                        label="Data Check In"
                                        type="date"
                                        id="departureDatePicker"
                                        ref={departureRef}
                                        readOnly={readOnly}
                                        placeholder="Seleziona la data"
                                        placeholderMin="Seleziona la data di partenza &nbsp; &nbsp;&nbsp;&nbsp;"
                                        hasValue={departure && departure.length ? true : false}
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                    />
                                </div> */}

              <div className="right-sm-0 w-100" style={{opacity: `${readOnly?"0.8":"1"}`}}>
                {
                  offer.minStay != offer.maxStay ?
                    <CustomDatePicker
                      setDatePickerOpen={setDatePickerOpen}
                      minDate={new Date(offer.startDate) >= new Date() ? new Date(offer.startDate) : new Date() + 1}
                      maxDate={new Date(new Date(offer.endDate).getTime() - offer.minStay * 24 * 60 * 60 * 1000)}
                      selected={departure}
                      label="Data Check In"
                      placeholder="Seleziona la data"

                      handleChange={(value) => {
                        let persistDateNew = {...persistDate}
                        persistDateNew[idx]=value;
                        setDeparture(value);
                        handleDepartureChange(value);
                        setPersistDate(persistDateNew)

                        localStorage.setItem("prevInDate",value);

                        let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
                        persistReadOnlyNewArrival[idx]=false;
                        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
                        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
                        
                      }}
                      setDeparture={setDeparture}
                      readOnly={readOnly}
                      persistDate={persistDate[idx]}
                      setArrival={setArrival}
                      persistArrival={persistArrival[idx]}
                    /> : <CustomDatePicker
                      setDatePickerOpen={setDatePickerOpen}
                      minDate={new Date(offer.startDate) >= new Date() ? new Date(offer.startDate) : new Date() + 1}
                      maxDate={new Date(new Date(offer.endDate).getTime() - offer.minStay * 24 * 60 * 60 * 1000)}
                      selected={departure}
                      isDateDisabled={disabledDates}
                      label="Data Check In"
                      placeholder="Seleziona la data"

                      handleChange={(value) => {
                        let persistDateNew = {...persistDate}
                        persistDateNew[idx]=value;
                        setDeparture(value);
                        handleDepartureChange(value);
                        setPersistDate(persistDateNew)


                        localStorage.setItem("prevInDate",value);

                        let persistReadOnlyNewArrival = {...persistReadOnlyArrival}
                        persistReadOnlyNewArrival[idx]=false;
                        setPersistReadOnlyArrival(persistReadOnlyNewArrival)
                        setReadOnlyArrival(persistReadOnlyNewArrival[idx])
                      }}
                      setDeparture={setDeparture}
                      readOnly={readOnly}
                      persistDate={persistDate[idx]}
                      setArrival={setArrival}
                      persistArrival={persistArrival[idx]}
                    />
                }
              </div>

              {/* <Input
                                        placeholder="Seleziona la data di partenza"
                                        label="Data Check In"
                                        value={userData.departure}
                                        style={{
                                            // textAlign: 'center',
                                            paddingLeft: '7%',
                                        }}
                                        readOnly={true}
                                        onClick={(e) => {
                                            try {
                                                if (!readOnly) departureRef?.current?.focus();
                                            } catch (err) {
                                                console.log(err);
                                            }
                                        }}
                                    /> */}
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2 relative">
              {/* <div className="">
                                    <Input
                                        handleChange={(e) => {
                                            setArrival(e.target.value);
                                            handleArrivalChange(e);
                                        }}
                                        value={arrival}
                                        name="arrival"
                                        id="arrivalDatePicker"
                                        // min={minArrivalDate}
                                        // max={maxArrivalDate}
                                        required
                                        label="Data Check Out"
                                        ref={arrivalRef}
                                        placeholder="Seleziona la data"
                                        placeholderMin="Seleziona la data di arrivo &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                        type="date"
                                        readOnly={readOnly}
                                        hasValue={arrival && arrival.length ? true : false}
                                        onClick={(e) => {
                                            try {
                                                arrivalRef?.current?.showPicker();
                                            } catch (err) {}
                                        }}
                                        onKeyDown={(e) => {
                                            e.preventDefault();
                                        }}
                                    />
                                </div> */}

              <div className="right-sm-0 w-100"  style={{opacity: `${readOnlyArrival?"0.8":"1"}`}}>
                {
                  offer.minStay != offer.maxStay ?
                    <CustomDatePicker
                      minDate={offer.minStay != offer.maxStay ? new Date(new Date(departure).getTime() + offer.minStay * 24 * 60 * 60 * 1000) : new Date(departure)}
                      maxDate={new Date(offer.endDate)}
                      setDatePickerOpen={setDatePickerOpen}
                      selected={arrival}
                      label="Data Check Out"
                      placeholder="Seleziona la data di arrivo"
                      handleChange={(value) => {
                        setArrival(value);
                        handleArrivalChange(value);
                        let persistArrivalNew = {...persistArrival}
                        persistArrivalNew[idx]=value;
                        setPersistArrival(persistArrivalNew)
                        localStorage.setItem("prevOutDate",value)
                      }}
                      setDeparture={setDeparture}
                      readOnly={readOnlyArrival}
                      persistDate={persistDate[idx]}
                      setArrival={setArrival}
                      persistArrival={persistArrival[idx]}
                    /> : <CustomDatePicker
                      minDate={offer.minStay != offer.maxStay ? (new Date(new Date(departure).getTime() + offer.minStay * 24 * 60 * 60 * 1000)) : new Date(new Date(departure).getTime() + 24 * 60 * 60 * 1000)}
                      maxDate={new Date(offer.endDate)}
                      setDatePickerOpen={setDatePickerOpen}
                      isDateDisabled={disabledDates}
                      selected={arrival}
                      label="Data Check Out"
                      placeholder="Seleziona la data di arrivo"
                      handleChange={(value) => {
                        setArrival(value);
                        handleArrivalChange(value);
                        let persistArrivalNew = {...persistArrival}
                        persistArrivalNew[idx]=value;
                        setPersistArrival(persistArrivalNew)
                        localStorage.setItem("prevOutDate",value)
                      }}
                      setDeparture={setDeparture}
                      readOnly={readOnlyArrival}
                      persistDate={persistDate[idx]}
                      setArrival={setArrival}
                      persistArrival={persistArrival[idx]}
                    />
                }
              </div>

              <div className="absolute top-0 left-0 w-100 px-2">
                {/* <Input
                                        placeholder="Seleziona la data di arrivo"
                                        label="Data Check Out"
                                        value={userData.arrival}
                                        readOnly={true}
                                        style={{
                                            // textAlign: 'center',
                                            paddingLeft: '7%',
                                        }}
                                        onClick={(e) => {
                                            try {
                                                if (!readOnly) arrivalRef?.current?.showPicker();
                                                // arrivalRef.current.style.opacity = 1;
                                            } catch (err) {
                                                console.log(err);
                                            }
                                        }}
                                    /> */}
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2">
              <Input
                value={selectItems[selectedPackage]}
                handleChange={(e) => {
                  selectItems.forEach((item, i) => {
                    if (item?.price != 0)
                      setSelectedPackage(e.target.value);
                      localStorage.setItem("selectedPackage",e.target.value)
                  });
                }}
                name="packageBoard"
                label="Pacchetto"
                select
                required
                options={breakdownNames}
              />
            </div>
          </div>

          {/* <Room room={userData.rooms[0]} id={0} handleUpdateRoom={handleUpdateRooms} /> */}

          {userData.rooms.map((item, i) => (
            <Room
              roomData={item}
              id={i}
              removeRoom={removeRoom}
              handleUpdateRoom={handleUpdateRooms}
            />
          ))}

          <div className="row g-3">
            <div className="col-sm-6 col-md-3">
              <span
                className="form-control __form-control"
                onClick={() => {
                  handleAddRoom();
                }}
              >
                <span>Aggiungi Stanza</span>
                <Plus2 />
              </span>
            </div>
          </div>
          <h5 ref={optionRef} className="mt-4 r-title">
            Offerta con
          </h5>
          <div ref={optionRef} className="__form-radio-group pt-2">
            <label className="__form-radio">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offer-with"
                  checked={value === "none"}
                  onChange={(e) => setvalue("none")}
                />
                <div className="form-check-label">Nessuna Opzione</div>
              </div>
              <div className="text">Nessun trasporto incluso</div>
            </label>
            <label className="__form-radio">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offer-with"
                  checked={value === "aliscafo"}
                  onChange={(e) => setvalue("aliscafo")}
                />
                <div className="form-check-label">Aliscafo + Transfer</div>
              </div>
              <div className="text">
                Aliscafo da Napoli Beverello A/R € 35 compreso trasferimenti
                porto hotel
              </div>
              {value == "aliscafo" && (
                <>
                  <br />
                  <Input
                    handleChange={handleChange}
                    name="bags"
                    type="number"
                    value={userData.bags}
                    label="Numero di Bagagli *"
                  // select
                  // options={options}
                  />
                </>
              )}
            </label>
            <label className="__form-radio">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offer-with"
                  checked={value === "ferry"}
                  onChange={(e) => setvalue("ferry")}
                />
                <div className="form-check-label">Traghetto + Transfer</div>
              </div>
              <div className="text">
                Traghetto da Napoli Calata porta di Massa o Pozzuoli A/R € 25
                compreso trasferimenti porto hotel
              </div>
              {value == "ferry" && (
                <>
                  <br />
                  <Input
                    value={userData.carSize}
                    handleChange={handleChange}
                    name={"carSize"}
                    label="Dimensione Auto"
                    select
                    options={options2}
                  />
                </>
              )}
            </label>
            {/* <label className="__form-radio">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="offer-with"
                                onChange={(e) => setvalue('high-speed')}
                            />
                            <div className="form-check-label">High Speed Train</div>
                        </div>
                        <div className="text">
                            Train from the main Italian cities, with transfer from Naples station to the port, sea
                            passages from Naples to Ischia, taxi from the port to the hotel starting from € 160.00 per
                            person round trip.
                        </div>
                        {value == 'high-speed' && (
                            <>
                                <br />
                                <Input
                                    handleChange={handleChange}
                                    name="numeroBaggliTrain"
                                    label="Numero di Bagagli"
                                    select
                                    options={options}
                                />
                            </>
                        )}
                    </label> */}
            <label className="__form-radio">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offer-with"
                  checked={value === "viaggio"}
                  onChange={(e) => setvalue("viaggio")}
                />
                <div className="form-check-label">
                  Viaggio dalla tua citta
                </div>
              </div>
              <div className="text">
                Viaggio incluso dalla tua città fino al trasferimento
                all'hotel
              </div>
              {value == "viaggio" && (
                <div className="row g-3 mt-2">
                  <div className="col-sm-6">
                    <Input
                      name="trasporto"
                      handleChange={handleChange}
                      value={userData.trasporto}
                      label="Tipo di trasporto preferito"
                      select
                      options={options3}
                    />
                  </div>
                  {/* <div className="col-sm-4">
                      <Input1
                        name="country"
                        handleChange={handleChange}
                        value={userData.country}
                        label="Country di Partenza"
                        select
                        options={europeanCountries}
                      />
                    </div> */}
                  <div className="col-sm-6">

                  <Autocomplete
                    onLoad={autocomplete => (autocomplete = autocomplete)}
                    options={{
                      types: ['(cities)'],
                      language: 'it'
                    }}
                  >
                    <Input
                      type="text"
                      label="Città de Partenza"
                      placeholder="Inserisci la città di partenza"
                      value ={userData.Citta}
                      name = "Citta"
                      handleChange={handleChange}
                      style={{ fontFamily: 'chillax', fontSize: '16px' }}
                    />
                  </Autocomplete>

                    {/* <ul className="city-suggestion-list" ref={cityInput}>
                      {suggestions.map((suggestion, indx) => (
                        suggestion && <li key={indx} onClick={() => { cityInput.current.style.display = "none"; setCity(suggestion) }} className="city-suggestion">{suggestion}</li>
                      ))}
                    </ul> */}

                  </div>
                </div>
              )}
            </label>
          </div>
          <br />
          <div className="msg-txt mb-4">
            Per offrirvi il miglior servizio Vi preghiamo di specificare, nel
            campo che segue, maggiori informazioni per i trasferimenti ed
            eventuali esigenze per la vostra vacanza
          </div>
          <textarea
            value={userData.note}
            name="note"
            onChange={handleChange}
            className="form-control __form-control p-3"
            placeholder="Note Extra, Richieste Particolari, Etc..."
          ></textarea>
          <div className="mt-3"></div>
          <label className="form-check form--check">
            <input
              required
              className="form-check-input"
              type="checkbox"
              value=""
              id="flexCheckDefault"
            />
            <span className="form-check-label">
              Ho preso visione e acconsento al{" "}
              <a
                href="https://www.hoescape.com/privacy-policy/"
                className="text-base"
                target="_blank"
                rel="noreferrer"
              >
                trattamento dei miei dati personali in conformitä al
                Regolamento europeo 679/2016 *
              </a>
            </span>
          </label>
          <div className="mt-3"></div>
          <label className="form-check form--check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="flexCheckDefault"
            />
            <span className="form-check-label">
              Dichiaro di volermi iscrivere al servizio newsletter per
              ricevere Ie migliori offerte
            </span>
          </label>
          {buttonDisabled ? (
            <div className="pt-4">
              <button
                style={{ opacity: 0.7 }}
                className="cmn-btn w-100"
                type="button"
              >
                Preventivo Inviato
              </button>
            </div>
          ) : (
            <div className="pt-4">
              <button className="cmn-btn w-100" type="submit">
                {sending ? (
                  <img
                    style={{ width: "25px" }}
                    src={loading}
                    alt="loading"
                  />
                ) : (
                  <>
                    Richiedi Preventivo <Send />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </>
    ) : (
      <>
        <img src={loading} height={"30px"} alt="" />
      </>
    )}
  </>
);
};
const options2 = [
  {
    options:
      "traghetto con auto fino 4 mt. da Pozzuoli A/R € 75 - passeggeri € 22",
    text: "traghetto con auto fino 4 mt. da Pozzuoli A/R € 75 - passeggeri € 22",
  },
  {
    options : "traghetto con auto tra i 4 mt. fino ai 4.5 mt. da Pozzuoli A/R € 90 - passeggeri € 22",
    text : "traghetto con auto tra i 4 mt. fino ai 4.5 mt. da Pozzuoli A/R € 90 - passeggeri € 22",
  },
  {
    options:
      "traghetto con auto su. ai 4 mt. da Pozzuoli A/R € 100 - passeggeri € 22",
    text: "traghetto con auto su. ai 4 mt. da Pozzuoli A/R € 100 - passeggeri € 22",
  },
];
const options3 = [
  {
    options: "Bus",
    text: "Bus da 85 € A/R compreso trasferimenti e passaggi marittimi",
  },
  {
    options: "Treno",
    text: "Treno alta velocità da € 99 A/R, compreso trasferimenti e passaggi marittimi",
  },
  {
    options: "Aereo",
    text: "Volo da € 199 A/R, compreso trasferimenti e passaggi marittimi",
  },
];

export default React.forwardRef(ViewInquiryForm);
