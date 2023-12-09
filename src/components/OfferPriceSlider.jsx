/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import scalapay from "../assets/img/scalapay.png";
import { FaqsItems } from "./FaqsItems";
import {
  AngleDown,
  AngleUp,
  Bus,
  Car,
  CheckIcon,
  NextIcon,
  PrevIcon,
  Ship,
  Train,

} from "./Icon";
import SelectDropDown from "./SelectDropDown";
import ViewInquiryForm from "./ViewInquiryForm";

function formatItalianDate(date) {
  const options = {
    day: "numeric",
    month: "short",
  };

  return date.toLocaleDateString("it-IT", options);
}

function calculateNights(endDate, minStay, maxStay) {
  const today = new Date();
  const end = new Date(endDate);

  // If end date is in the past, set it to one week from today
  if (end.getTime() < today.getTime()) {
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(today.getDate() + 7);
    end.setDate(oneWeekFromToday.getDate());
    end.setMonth(oneWeekFromToday.getMonth());
    end.setFullYear(oneWeekFromToday.getFullYear());
  }

  // Calculate the time difference in milliseconds
  const timeDifference = end.getTime() - today.getTime();

  // Convert milliseconds to days
  const nights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Check if nights is within minStay and maxStay range
  if (nights >= minStay && nights <= maxStay) {
    return Math.abs(nights); // Ensure nights is always positive
  } else {
    // If not, return the closest value within the range
    if (nights < minStay) {
      return minStay;
    } else {
      return maxStay;
    }
  }
}





const OfferPriceSlider = (
  {
    bestPossiblePrice,
    offers,
    serial,
    setOfferButtonIn,
    offerButtonIn,
    hotel,
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
    handleOfferClose,
    departure,
    setDeparture,
    arrival,
    setArrival,
    readOnly,
    setReadOnly,
    readOnlyArrival,
    setReadOnlyArrival
  },
  ref
) => {
  const [index, setIndex] = useState(0);
  const [innerCollapse, setInnerCollapse] = useState(false);
  const sliderRef = useRef(null);

  const [persistDate,setPersistDate] = useState({})
  const [persistArrival,setPersistArrival] = useState({})
  const [persistReadOnly,setPersistReadOnly] = useState({})
  const [persistReadOnlyArrival,setPersistReadOnlyArrival] = useState({})

  let calculatedNights = Math.abs((new Date(checkInDate) - new Date(checkOutDate)) / (1000 * 60 * 60 * 24))
  const calculateNightsNew= ( minStay, maxStay) =>{
    if(minStay===maxStay){
      return maxStay
    }
    else{
      if (calculatedNights < minStay) {
        calculatedNights = minStay
      }
      else if (calculatedNights > maxStay) {
        calculatedNights = maxStay
      }
      return calculatedNights

    }
  }

  const [innerOffers, setInnerOffers] = useState(offers);

  const [activeData, setActiveData] = useState(innerOffers[index]);

  useEffect(() => {
    setActiveData(innerOffers[index]);
  }, [innerOffers]);
  window.innerOffers = innerOffers
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    setFaqs([
      {
        title: "Descrizione Offerta",
        paragraph: activeData?.description ?? "",
        text: [],
      },
      {
        title: "Descrizione Hotel",
        paragraph: hotel?.hotelDescription ?? "",

        hotelDescriptionProps: [
          {
            title: hotel?.roomsTitle,
            description: hotel?.roomsDescription,
          },
          {
            title: hotel?.spaTitle ,
            description: hotel?.spaDescription ,
          },
          {
            title: hotel?.restaurantTitle,
            description: hotel?.restaurantDescription,
          }
        ],

        serviceTitle: "Dettagli Servizi",
        serviceDetails: hotel?.serviceDetails ?? "",

      },
      {
        title: "Pacchetto Incluso",
        paragraph: activeData?.packages ?? "",
        text: [],
      },
      {
        title: "Supplementi",
        supliment: activeData?.supplement ?? [],
        paragraph: (activeData?.supplement && true) || false,
        text: [],
      },
      {
        title: "Riduzioni",
        data:
          activeData?.ageReduction.sort((a, b) => a.agelimit - b.agelimit) ??
          [],
        paragraph: (activeData?.ageReduction && true) || false,
        text: [],
      },
    ]);
  }, [activeData, hotel]);

  const handleSelectedItemChange = (i, nextIndex) => {
    const newOffers = innerOffers.map((offer, index) => {
      if (i === index) return { ...offer, selectedOption: nextIndex };
      else return offer;
    });
    setInnerOffers(newOffers);
  };

  const scrollRef = useRef();
  useEffect(() => {
    if (innerCollapse) {
      if (scrollRef) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setOfferButtonIn(false);
    } else {
      setOfferButtonIn(true);
    }
  }, [innerCollapse]);

  const [beginningReached, setBeginningReached] = useState(true);
  const [endReached, setEndReached] = useState(false);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;

    const swiperInstance = sliderRef.current.swiper;

    if (!beginningReached) {
      setEndReached(false);
      swiperInstance.slidePrev();

      if (swiperInstance.translate === 0) {
        setBeginningReached(true);
      } else {
        setBeginningReached(false);
      }
    }
  }, [beginningReached]);

  const handlePrevDrag = () => {
    setEndReached(false);
  };

  const handleNextDrag = () => {
    setBeginningReached(false);
  };

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    const swiperInstance = sliderRef.current.swiper;

    if (!endReached) {
      swiperInstance.slideNext();

      setBeginningReached(false);
    }
  }, [endReached]);

  const [currentBreakdown, setCurrentBreakdown] = useState(activeData?.breakdown[1].breakdownId || activeData?.breakdown[0].breakdownId || activeData?.breakdown[2].breakdownId)

  const breakDownTypeChecker = (currentOffer) => {
    if(currentOffer?.breakdown[1].price!=0){
      return currentOffer?.breakdown[1].breakdownId
    }
    else if(currentOffer?.breakdown[0].price!=0){
      return currentOffer?.breakdown[0].breakdownId
    }
    else if(currentOffer?.breakdown[2].price!=0){
      return currentOffer?.breakdown[2].breakdownId
    }
  }


  const breakDownTypeResetter = (currentOffer) => {
    const breakdown = breakDownTypeChecker(currentOffer)
    // console.log(breakdown)
    setCurrentBreakdown(breakdown)

  }
  useEffect(()=>{
   localStorage.setItem("price", activeData?.minStay === activeData?.maxStay 
    ?
    activeData.breakdown[breakDownTypeChecker(activeData)-1].price
    :
    (((!(activeData?.minStay === activeData?.maxStay) && activeData?.id===activeData?.id) ? (activeData.breakdown[currentBreakdown - 1]?.price!==0 ? (activeData.breakdown[currentBreakdown - 1]?.price) : activeData.breakdown[breakDownTypeChecker(activeData) - 1].price) : activeData.breakdown[breakDownTypeChecker(activeData) - 1].price)* calculatedNights))

  },[activeData])


  return (
    <>
      <div className="offer-item-middle-title gap-2 mb-3">
        <span>Selezionate per te</span>
        {innerOffers.length > 1 ? (
          <div className="d-flex gap-2">
            <span
              className={`prev ${beginningReached
                  ? "swiper-control-disabled"
                  : "swiper-control-active"
                }`}
              onClick={!beginningReached ? handlePrev : () => { }}
            >
              <PrevIcon />
            </span>
            <span
              className={`next ${endReached ? "swiper-control-disabled" : "swiper-control-active"
                }`}
              onClick={!endReached ? handleNext : () => { }}
            >
              <NextIcon />
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="offer-price-slider mb-4">
        <Swiper
          ref={sliderRef}
          slidesPerView={1.1}
          spaceBetween={0}
          modules={[Navigation, Pagination]}
          onSlideNextTransitionStart={handleNextDrag}
          onSlidePrevTransitionStart={handlePrevDrag}
          onReachBeginning={() => {
            setBeginningReached(true);
          }}
          onReachEnd={() => {
            setEndReached(true);
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            500: {
              slidesPerView: 1.5,
              spaceBetween: 15,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 2.2,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
          }}
        >

          {offers?.map((item, i) => {
            calculateNightsNew(item?.minStay, item?.maxStay)
          return(
            <SwiperSlide key={i}>
              <div
                className={`offer-price-slider-item ${i === index ? "active" : ""
                  }`}
                onClick={() => {
                  setIndex(i);
                  breakDownTypeResetter(innerOffers[i]);
                  setActiveData(innerOffers[i]);
                  setDeparture(persistDate[i])
                  setArrival(persistArrival[i])
                }}
                style={{ margin: "1px" }}
              >
                <div className="short-info">
                  <div className="info">
                    <div className="duration">Dal</div>
                    <div className="duration">
                      {formatItalianDate(new Date(item?.startDate))} al{" "}
                      {formatItalianDate(new Date(item?.endDate))}
                    </div>

                  </div>

                  <h3 className="price">
                    {item?.minStay === item?.maxStay 
                      ?
                      item.breakdown[breakDownTypeChecker(item)-1].price
                      :
                      (((!(activeData?.minStay === activeData?.maxStay) && activeData?.id===item?.id) ? (item.breakdown[currentBreakdown - 1]?.price!==0 ? (item.breakdown[currentBreakdown - 1]?.price) : item.breakdown[breakDownTypeChecker(item) - 1].price) : item.breakdown[breakDownTypeChecker(item) - 1].price)* calculatedNights)}
                    {(item?.breakdown[1]?.price && item?.breakdown[1].currency) ||
                      (item?.breakdown[0]?.price && item?.breakdown[0].currency) ||
                      (item?.breakdown[2]?.price && item?.breakdown[2].currency)}
                  </h3>

                </div>
                <div className="text--small">
                  {calculateNightsNew(
                    item?.minStay,
                    item?.maxStay
                  )}
                  {(calculateNightsNew(
                    item?.minStay,
                    item?.maxStay
                  ) === 1 &&
                    " Notte ") ||
                    " Notti "}
                  -{" "}
                  {item?.minStay === item?.maxStay
                    ?
                    item.breakdown[breakDownTypeChecker(item) - 1].name
                    :
                    ((!(activeData?.minStay === activeData?.maxStay) && activeData?.id===item?.id) ? (item.breakdown[currentBreakdown - 1]?.price!==0 ? (item.breakdown[currentBreakdown - 1]?.name) : item.breakdown[breakDownTypeChecker(item) -1].name) : item.breakdown[breakDownTypeChecker(item) -1].name)}
                </div>
              </div>
            </SwiperSlide>
          )}
          )}
        </Swiper>
      </div>
      <div className="py-4">
        <button
          className={`cmn-btn w-100 ${innerCollapse ? "disable" : ""}`}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#package-inner-${serial}`}
          onClick={() => setInnerCollapse(!innerCollapse)}
        >
          <span className={`${innerCollapse ? "text-title" : ""}`}>
            Richiedi Preventivo
          </span>{" "}
          {innerCollapse ? <AngleUp /> : <AngleDown />}
        </button>
      </div>
      <div className="offer-price-slider-bottom">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="full-board">
              <div className="full-board-top">
                <div>
                  <SelectDropDown
                    selectedOption={currentBreakdown}
                    handleChange={(i) => {
                      // console.log(i)
                      setCurrentBreakdown(i)
                      handleSelectedItemChange(index, i);
                    }}
                    selectItems={activeData?.breakdown?.filter(item => item?.price != 0)}
                  />

                  <span>Bevande {activeData?.beverageAvailability}</span>
                </div>
                <h3>
                  {calculateNightsNew(
                    activeData?.minStay,
                    activeData?.maxStay
                  )}
                  {(calculateNightsNew(
                    activeData?.minStay,
                    activeData?.maxStay
                  ) === 1 &&
                    " Notte ") ||
                    " Notti "}
                </h3>
              </div>
              <ul className="check-lists">
                {activeData?.tags?.map((item, i) =>
                  item && item.length ? (
                    <li key={i}>
                      <CheckIcon />
                      {item}
                    </li>
                  ) : (
                    <></>
                  )
                )}
              </ul>
              <blockquote className="mb-4 blockquote">
                PER QUESTA OFFERTA PUOI PAGARE CON INTERESSI ZERO IN 3 COMODE
                RATE CON SCALAPAY{" "}
              </blockquote>
              <div className="text-center">
                <img src={scalapay} alt="" className="mw-100" />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <FaqsItems id={`package-${serial}`} data={faqs}  />
          </div>
        </div>
        <div className="py-3"></div>
        <div className="row gx-4 gy-2">
          {infos?.map((item, i) => (
            <div className="col-md-6" key={i}>
              <div className="infos-item">
                <h5 className="title">
                  <div>
                    {item?.icon?.map((ico, j) => (
                      <span className="icon" key={i}>
                        {ico}
                      </span>
                    ))}
                  </div>
                  <span className="s-title">{item?.title}</span>
                </h5>
                {item?.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="inquiry-form pt-32 collapse"
        id={`package-inner-${serial}`}
      >
        <div className="scroll-pos" ref={scrollRef}></div>
        <ViewInquiryForm
          setUserData={setUserData}
          userData={userData}
          sending={sending}
          setvalue={setvalue}
          value={value}
          breakdownNames={activeData?.breakdown?.filter(item => item?.price != 0)}
          handleSubmit={handleSubmit}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          offer={activeData}
          Hotel={hotel}
          NomeModulo={hotel["NomeModulo"]}
          totalPriceForUser={activeData?.breakdown || []}
          buttonDisabled={buttonDisabled}
          handleUpdateRooms={handleUpdateRooms}
          setDatePickerOpen={setDatePickerOpen}
          selectItems={activeData?.breakdown || []}
          selectedPackage={activeData?.breakdown?.filter(item => item?.price != 0)}
          handleOfferClose={handleOfferClose}
          setSelectedPackage={(i) => {
            handleSelectedItemChange(index, i);
          }}
          departure={departure}
          setDeparture={setDeparture}
          persistDate={persistDate}
          setPersistDate={setPersistDate}
          idx={index}
          arrival={arrival}
          setArrival={setArrival}
          persistArrival={persistArrival}
          setPersistArrival={setPersistArrival}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          persistReadOnly={persistReadOnly}
          setPersistReadOnly={setPersistReadOnly}
          readOnlyArrival={readOnlyArrival}
          setReadOnlyArrival={setReadOnlyArrival}
          persistReadOnlyArrival={persistReadOnlyArrival}
          setPersistReadOnlyArrival={setPersistReadOnlyArrival}
        />
      </div>
    </>
  );
};

const infos = [
  {
    icon: [<Ship />],
    title: "In questa offerta rientra: Aliscafo + Transfer",
    text: "FORMULA VIP: Aliscafo + Transfer in hotel (andata e ritorno) €35 a persona invece di € 71,00\nFORMULA VIP: Traghetto + Transfer in hotel (andata e ritorno) €25 a persona invece di € 71,00",
  },
  {
    icon: [<Ship />, <Car />],
    title: "In questa offerta rientra: Traghetto + Auto",
    text: "Auto (fino a 4 metri) con conducente a € 70,00 (invece di € 130,00) andata a ritorno. Per i passeggeri il costo è di € 17 a passeggero.",
  },
  {
    icon: [<Bus />],
    title: "In questa offerta rientra: Bus da oltre 120 città italiane",
    text: "Bus dalle principali città italiane fino in hotel, incluso biglietto traghetto facchinaggio e trasporto bagagli, a partire da € 69,00 a persona andata e ritorno.",
  },
  {
    icon: [<Train />],
    title: "In questa offerta rientra: Treno dall'Italia",
    text: "Treno dalle principali città italiane, con transfer dalla stazione di Napoli al porto, passaggi marittimi da Napoli per Ischia, taxi dal porto fino all'hotel, andata e ritorno, a partire da € 160,00 a persona.",
  },
];

export default React.forwardRef(OfferPriceSlider);
