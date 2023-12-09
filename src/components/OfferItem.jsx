import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import mask from "../assets/img/mask.png";
import bg_3 from "../assets/img/offer-bg-2.png";
import bg_4 from "../assets/img/offer-bg-3.png";
import bg_2 from "../assets/img/offer-bg.png";
import bg_1 from "../assets/img/regular-bg.png";

import loading from "../assets/img/dualLoading.gif";
import DistanzaSlider from "./DistanzaSlider";
import {
  AngleDown,
  AngleUp,
  LocationThree,
  NextArrow,
  Phone,
  PrevArrow,
  Star,
  Whatsapp,
} from "./Icon";
import OfferPriceSlider from "./OfferPriceSlider";
const OfferItem = (props, ref) => {
  const {
    offer,
    index,
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
    config,
    // bestPossiblePrice,
    // setBestPossiblePrice
  } = props;
  // const [bestPossiblePrice, setBestPossiblePrice] = useState()

  const [loadingOffers, setLoadingOffers] = useState(false);

  const [offersLoaded, setOffersLoaded] = useState(false);
  const [offers, setOffers] = useState(null);

  const [offerOpen, setOfferOpen] = useState(false);
  const [offerButtonIn, setOfferButtonIn] = useState(true);

  const [departure,setDeparture] = useState("")
  const [arrival,setArrival] = useState("")
  const [readOnly, setReadOnly] = useState(false);
  const [readOnlyArrival, setReadOnlyArrival] = useState(false);

  const sliderRef = useRef(null);
  const images = hotel.immaginiUrl
    ? hotel.immaginiUrl.split("\\\\n")
    : hotel.img;

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  useEffect(() => {
    localStorage.setItem("prevInDate",new Date(checkInDate));
    localStorage.setItem("prevOutDate",new Date(checkOutDate));
    if (!offersLoaded) {
      // Assuming hotel.offers is an array of offer objects with properties like startDate, endDate, and minNightsRequired.

      // Step 1: Filter offers that contain the current day
      const currentDay = new Date();
      const currentDayTimestamp = currentDay.getTime();

      const validOffers = hotel.offers.filter((offer) => {
        const offerStartDate = new Date(offer.startDate).getTime();
        const offerEndDate = new Date(offer.endDate).getTime();

        return offerStartDate >= currentDayTimestamp;
      });

      // Step 2: Apply logic for user-selected dates
      const selectedStartDate = new Date(config?.startDate);
      const selectedEndDate = new Date(config?.endDate);

      const filteredOffers = validOffers.filter((offer) => {
        const offerStartDate = new Date(offer.startDate).getTime();
        const offerEndDate = new Date(offer.endDate).getTime();

        // Check if the offer is within three days before and after selected dates
        const startDateDifference = Math.abs(selectedStartDate.getTime());
        const endDateDifference = Math.abs(selectedEndDate.getTime());

        return (
          startDateDifference >= 3 * 24 * 60 * 60 * 1000 ||
          endDateDifference >= 3 * 24 * 60 * 60 * 1000
        );
      });

      // Apply flexibility criteria for 2 nights stay
      const flexibility = 1; // 1 night flexibility

      const finalOffers = validOffers.sort((a, b) => {
        const aStartDate = new Date(a.startDate).getTime();
        const bStartDate = new Date(b.startDate).getTime();

        const aEndDate = new Date(a.endDate).getTime();
        const bEndDate = new Date(b.endDate).getTime();

        const aFlexibility =
          aStartDate - selectedStartDate.getTime() <=
            flexibility * 24 * 60 * 60 * 1000 &&
          selectedEndDate.getTime() - aEndDate <=
            flexibility * 24 * 60 * 60 * 1000;

        const bFlexibility =
          bStartDate - selectedStartDate.getTime() <=
            flexibility * 24 * 60 * 60 * 1000 &&
          selectedEndDate.getTime() - bEndDate <=
            flexibility * 24 * 60 * 60 * 1000;

        if (aFlexibility && !bFlexibility) {
          return -1;
        } else if (!aFlexibility && bFlexibility) {
          return 1;
        }

        return aEndDate - bEndDate; // Sort by end date
      });

      // Now finalOffers contains the offers that match the criteria and are sorted according to the specified logic.
      setOffers(finalOffers);
    }
  }, []);

  useEffect(() => {
    if (offers) {
      setLoadingOffers(false);
      setOffersLoaded(true);
    }
  }, [offers]);

  const [lowestOffered, setLowOffer] = useState(
    (hotel?.offers && hotel?.offers.length && hotel?.offers[0]) || {}
  );

  useEffect(() => {
    const offers = hotel?.offers || [];
    let lowestOffer = null;

    for (const offer of offers) {
      if (
        !lowestOffer ||
        offer.lowestOfferPrice < lowestOffer.lowestOfferPrice
      ) {
        lowestOffer = offer;
      }
    }

    setLowOffer(lowestOffer);
  }, [hotel]);

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

  // const [bestPossiblePrice, setBestPossiblePrice] = useState(10000)

  function calculateOfferPrice(offer) {
    if (offer.minStay === offer.maxStay) {
      return offer.breakdown[1]?.price || offer.breakdown[0]?.price || offer.breakdown[2]?.price;
    } else {
      const calculatedNights = Math.abs((new Date(checkInDate) - new Date(checkOutDate)) / (1000 * 60 * 60 * 24));
      const clampedNights = Math.max(offer.minStay, Math.min(calculatedNights, offer.maxStay));

      return (offer.breakdown[1]?.price || offer.breakdown[0]?.price || offer.breakdown[2]?.price) * clampedNights;
    }
  }
  function reFilterOffers(offerNum) {
    let tempArray = [];
    for(let i=0;i<offerNum?.length - 1;i++){
      for(let j =i+1;j<offerNum?.length;j++){
        if(offerNum[i].startDate==offerNum[j].startDate && offerNum[i].endDate==offerNum[j].endDate){
          if((offerNum[i]?.minStay===offerNum[j].minStay) && (offerNum[i]?.maxStay===offerNum[j].maxStay)){
            if((offerNum[i]?.breakdown[0]?.price !== 0 && offerNum[j].breakdown[0]?.price === 0 ) || (offerNum[i]?.breakdown[0]?.price === 0 && offerNum[j].breakdown[0]?.price !== 0 ) || (offerNum[i]?.breakdown[0]?.price === 0 && offerNum[j].breakdown[0]?.price === 0 )){
              if((offerNum[i]?.breakdown[1]?.price !== 0 && offerNum[j].breakdown[1]?.price === 0 ) || (offerNum[i]?.breakdown[1]?.price === 0 && offerNum[j].breakdown[1]?.price !== 0 ) || (offerNum[i]?.breakdown[1]?.price === 0 && offerNum[j].breakdown[1]?.price === 0 )){
                if((offerNum[i]?.breakdown[2]?.price !== 0 && offerNum[j].breakdown[2]?.price === 0 ) || (offerNum[i]?.breakdown[2]?.price === 0 && offerNum[j].breakdown[2]?.price !== 0 ) || (offerNum[i]?.breakdown[2]?.price === 0 && offerNum[j].breakdown[2]?.price === 0 )){
                  tempArray.push(offerNum[i]);
                  let temp = JSON.parse(JSON.stringify(offerNum[i]));
                  temp.breakdown[0].price = Math.max(offerNum[i].breakdown[0]?.price,offerNum[j].breakdown[0]?.price);
                  temp.breakdown[1].price = Math.max(offerNum[i].breakdown[1]?.price,offerNum[j].breakdown[1]?.price);
                  temp.breakdown[2].price = Math.max(offerNum[i].breakdown[2]?.price,offerNum[j].breakdown[2]?.price);
                  
                  offerNum[i]=temp;
                  offerNum.splice(j,1)
                  break;
                }
              }
            }
          }
        }
        
      }
    }

    return offerNum?.filter(itemB => !tempArray.includes(itemB));
  }
  const requiredNights = Math.abs((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
  function filterOffers(offers, tempStartDate, tempEndDate) {
    const maxDaysDifference = 3;
    return offers?.filter((offer) => {
        const offerStartDate = new Date(offer?.startDate);
        const offerEndDate = new Date(offer?.endDate);
        const current = new Date();
        offerStartDate.setHours(0, 0, 0, 0);
        offerEndDate.setHours(0, 0, 0, 0);
        const tempStartDateObj = new Date(tempStartDate);
        const tempEndDateObj = new Date(tempEndDate);

        const oneAndHalfMonthsLater = new Date(tempEndDateObj);
        oneAndHalfMonthsLater.setMonth(oneAndHalfMonthsLater.getMonth() + 1);
        oneAndHalfMonthsLater.setDate(oneAndHalfMonthsLater.getDate() + 15); 
        const daysDiffStart = Math.abs((offerStartDate - tempStartDateObj) / (1000 * 60 * 60 * 24));
        const daysDiffEnd = Math.abs((offerEndDate - tempEndDateObj) / (1000 * 60 * 60 * 24));
        const specialCase = Math.abs((offerEndDate - current) / (1000 * 60 * 60 * 24));

        let numofnights = 0;
        if (offer.minStay == offer.maxStay) {
          numofnights = offer.maxStay;
        } else {
          if(requiredNights<=offer.minStay){
            numofnights=offer.minStay;
          }
          else if(requiredNights>=offer.maxStay){
            numofnights=offer.maxStay;
          }
          else{
            for(let j = offer.minStay+1;j<offer.maxStay;j++){
              if(j==requiredNights){
                numofnights=j;
              }
            }
          }
        }

        const startDateValid = (daysDiffStart <= maxDaysDifference && daysDiffStart >= (maxDaysDifference * -1));
        const endDateValid = (daysDiffEnd <= maxDaysDifference && daysDiffEnd >= (maxDaysDifference * -1));
        const nightsDifferenceValid = Math.abs(requiredNights - numofnights) <= 2;

        if((0>=( offerStartDate - tempStartDateObj)  && 0>=(tempStartDateObj - offerEndDate)) && (0>=(offerStartDate - tempEndDateObj) && 0>=(tempEndDateObj - offerEndDate))){
          return (
            requiredNights + 2 >= numofnights &&
            // requiredNights -2 <= numofnights &&
            specialCase >= numofnights + 1 &&
            (offer.numofnights = numofnights)
          );
      }
        else if((0>=( offerStartDate - tempStartDateObj)  && 0>=(tempStartDateObj -offerEndDate)) && !(0>=(offerStartDate - tempEndDateObj) && 0>=(tempEndDateObj - offerEndDate))){
          const userNight = Math.abs((offerEndDate - tempStartDateObj) / (1000 * 60 * 60 * 24));
          return (
            requiredNights-2-userNight<=userNight &&
            requiredNights +2 >= numofnights && 
            specialCase >= numofnights + 1 &&
            (offer.numofnights = numofnights)
          );
      }
        else if(!(0>=( offerStartDate - tempStartDateObj)  && 0>=(tempStartDateObj -offerEndDate)) && (0>=(offerStartDate - tempEndDateObj) && 0>=(tempEndDateObj - offerEndDate))){
          const userNight = Math.abs((offerStartDate - tempEndDateObj) / (1000 * 60 * 60 * 24));
          return (
            requiredNights-2-userNight<=userNight &&
            requiredNights +2 >= numofnights && 
            specialCase >= numofnights + 1 &&
            (offer.numofnights = numofnights)
          );
      }
          if(Math.abs(requiredNights - numofnights) >=0 && nightsDifferenceValid){
            return (
              requiredNights + 2 >= numofnights &&
              requiredNights -2 <= numofnights &&
              oneAndHalfMonthsLater>offerStartDate &&
              specialCase >= numofnights + 1 &&
              (offer.numofnights = numofnights)
            );
          }

      })
      .sort((a, b) => {
        if (a?.startDate === b?.startDate) {
          if(a?.endDate===b?.endDate){
            const numofnightsA = a?.numofnights;
            const numofnightsB = b?.numofnights;
            if ((numofnightsA-requiredNights) === (numofnightsB-requiredNights)) {
              const priceA = calculateOfferPrice(a);
              const priceB = calculateOfferPrice(b);
            return priceA - priceB;
            }
            return Math.abs(numofnightsA-requiredNights) - Math.abs(numofnightsB-requiredNights);
          }
          return new Date(a?.endDate) - new Date(b?.endDate);
        }
        return new Date(a?.startDate) - new Date(b?.startDate);
      });
  }
  let offerNum = filterOffers(offers, checkInDate, checkOutDate);
  // let offerNum = reFilterOffers(offerNum2);
  // let offerNum = filterOffers(offers, checkInDate, checkOutDate);
  let bestOfferIndex =0;
  let diffOffer = 10000000;
    for(let i = 0;i<offerNum?.length;i++){
      const startDiff = Math.abs((new Date(offerNum[i]?.startDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
        const endDiff = Math.abs((new Date(offerNum[i]?.endDate) - new Date(checkOutDate)) / (1000 * 60 * 60 * 24));
        const diff = Math.abs(startDiff+endDiff);
        if(diff < diffOffer){
          diffOffer=diff;
          bestOfferIndex=i;
        }
  }
  let newOfferArray = [];
  if(bestOfferIndex!=0) {
    let tempo=offerNum[bestOfferIndex];
    offerNum[bestOfferIndex]=offerNum[bestOfferIndex-1];
    offerNum[bestOfferIndex-1] = tempo;
    bestOfferIndex=bestOfferIndex-1;
  }
  for(let i =bestOfferIndex;i<offerNum?.length;i++){
    newOfferArray.push(offerNum[i]);
  }
  newOfferArray=reFilterOffers(newOfferArray)
  let bestPossiblePrice = 10000;
    newOfferArray?.map((item, id) => {
      if (item?.minStay === item?.maxStay) {
        const myVar = item?.breakdown[1]?.price || item?.breakdown[0]?.price || item?.breakdown[2]?.price
        if (bestPossiblePrice > myVar) {
          bestPossiblePrice = myVar
        }
      }
      else {
        let calculatedNights =  Math.abs((new Date(checkInDate) - new Date(checkOutDate)) / (1000 * 60 * 60 * 24));
        if(calculatedNights<item?.minStay){
          calculatedNights=item.minStay
        }
        else if(calculatedNights>item?.maxStay){
          calculatedNights=item.maxStay
        }
        const myVar2 = (item?.breakdown[1]?.price ||
          item?.breakdown[0]?.price ||
          item?.breakdown[2]?.price) * calculatedNights

          if (bestPossiblePrice > myVar2) {
          bestPossiblePrice=myVar2
        }
      }
      hotel.bestPossiblePrice=bestPossiblePrice;

    })
    hotel.finalOffers=newOfferArray

  // console.log(newOfferArray , " :: newOfferArray")


  return (
    <div className="offer-item">
      <div
        className="offer-item-top"
        style={{
          background: `url(${
            offer
              ? index % 3 === 0
                ? bg_4
                : index % 3 === 1
                ? bg_2
                : bg_3
              : bg_1
          }) no-repeat center center / cover`,
        }}
      >
        <div
          className={`offer-item-top-top d-flex justify-content-between align-items-center ${
            hotel.ticker ? "has-ticker" : ""
          }
					`}
        >
          <div className="rating">
            {hotel?.rating && (
              <>
                {Array.from({ length: hotel?.rating }, (_, index) => (
                  <Star key={index} />
                ))}
              </>
            )}
          </div>

          <div className={`price-area d-flex flex-col ${index<=2 ? "bestOffers" : ""}`}>
            <div>A PARTIRE DA (giorno)</div>
            <h4
              className="font-bold align-self-end"
              style={{ color: "var(--title)" }}
            >
              {(lowestOffered && lowestOffered?.lowestOfferPrice) || bestPossiblePrice}
              {lowestOffered && lowestOffered?.breakdown[0]?.currency}
              
            </h4>
          </div>

          {index<=2 || hotel.ticker ? (
            <span className="ticker d-none d-md-flex ">
              <span>{(index === 1 && "Più venduto") || (index === 2 && "Prezzo più basso")}</span>
            </span>
          ) : (
            ""
          )}
        </div>
        <div className="offer-top-middle d-flex flex-wrap justify-content-between">
          <div className="offer-left-side">
            <div
              className="slider-area"
              style={{
                WebkitMask: `url(${mask}) no-repeat center center / contain`,
              }}
            >
              {hotel?.images.length>1 && <div className="prev-arrow" onClick={handlePrev}>
                <PrevArrow />
              </div>}
              {hotel?.images.length>1 && <div className="next-arrow" onClick={handleNext}>
                <NextArrow />
              </div>}
              {index <= 2|| hotel.ticker ? (
                <span className="ticker d-md-none ">
                  <span>{hotel.ticker ? hotel.ticker : (index === 1 && "Più venduto") || (index === 2 && "Prezzo più basso")}</span>
                </span>
              ) : (
                ""
              )}
              <Swiper
                spaceBetween={20}
                modules={[Pagination, Navigation]}
                // pagination={{ clickable: true }}
                ref={sliderRef}
              >
                {hotel?.images
                  // .slice(0, hotel?.images.length - 1)
                  .map((item, i) => (
                    <SwiperSlide key={i}>
                      <div className="img-item">
                        <img src={item.src} alt="" />
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
              {/* {ticker ? (
                                <span className="ticker d-md-none">
                                    <span>{ticker}</span>
                                </span>
                            ) : (
                                ''
                            )} */}
            </div>
            <div className="slider-content-area">
              <h5 className="title">
                <a href="#0" className="text-title">
                  {hotel?.name}
                </a>
              </h5>
              <span className="location">
                <LocationThree /> {hotel?.state}
              </span>

              <h6 className="subtitle">
                {hotel?.summaryDescription}
              </h6>
              <div className="lorem">
                {hotel?.hotelDescription}
              </div>
            </div>
          </div>
          <div className="offer-right-side">
            <DistanzaSlider distanzaData={hotel?.distance} />
            <div className="offer-btn-grp">
              <button
                className={`cmn-btn ${offerOpen ? "disable" : ""}`}
                data-bs-toggle="collapse"
                // data-bs-target={`#offer-${index}`}
                onClick={() => setOfferOpen(!offerOpen)}
              >
                {offerOpen ? (
                  <span className="text-title">
                    Chiudi Offerta <AngleUp />
                  </span>
                ) : (
                  <span>
                    Vedi Offerta <AngleDown />
                  </span>
                )}
              </button>
              <button
                type="button"
                className="outline-0 bg-transparent whatsapp-btn"
              >
                <a
                  href={`https://api.whatsapp.com/send/?phone=3908119758555&text=${process.env.REACT_APP_WHATSAPP_TEXT} &type=phone_number&app_absent=0`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Whatsapp />
                </a>
              </button>
              <a href="Tel:+08118555211" className="tel-btn">
                <div className="icon">
                  <Phone color="#24A9E0" />
                </div>
                <div className="cont">
                  <div>Parliamone!</div>
                  <div className="subtxt">{process.env.REACT_APP_PHONE_NUMBER}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {!offerOpen ? null : (
        <div className="offer-item-middle " id={`offer-${index}`}>
          <div className="overlayer" />
          {loadingOffers ? (
            <OffersLoading />
          ) : newOfferArray && newOfferArray.length ? (
            
            <OfferPriceSlider
              bestPossiblePrice={bestPossiblePrice}
              setUserData={setUserData}
              userData={userData}
              sending={sending}
              setvalue={setvalue}
              value={value}
              handleSubmit={handleSubmit}
              offers={newOfferArray}
              hotel={hotel}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              setOfferButtonIn={setOfferButtonIn}
              offerButtonIn={offerButtonIn}
              serial={index}
              setDatePickerOpen={setDatePickerOpen}
              buttonDisabled={buttonDisabled}
              handleUpdateRooms={handleUpdateRooms}
              handleOfferClose={() => {
                setOfferOpen(!offerOpen);
              }}
              departure={departure}
              setDeparture={setDeparture}
              arrival={arrival}
              setArrival={setArrival}
              readOnly={readOnly}
              setReadOnly={setReadOnly}
              readOnlyArrival={readOnlyArrival}
              setReadOnlyArrival={setReadOnlyArrival}

            />
          ) : (
            <>
              <h1>No offers to show</h1>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.forwardRef(OfferItem);

const OffersLoading = () => {
  return <img src={loading} alt="loading" className="w-[2rem] h-[2rem]" />;
};
