/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Loading from "./components/Layouts/Loading";
import MainSection from "./components/MainSection";
import { BASE_API_URL } from "./keys";
import formatDate from "./utils/formatDate";
import getDateString from "./utils/getDateString";
import values from "./values";

function Home() {
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const [loadingHotels, setloadingHotels] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [initialConfigData, setInitialConfigData] = useState(null);

  const [lastChange, setLastChange] = useState(null);
  const [startEndDate, setStartEndDate] = useState({});

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [config, setConfig] = useState(null);
  const [hotels, setHotels] = useState([]);

  const [comunes, setComunes] = useState([]);

  const [stelles, setStelles] = useState([]);

  const [fascias, setFascias] = useState([]);

  const [distances, setDistances] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const loadInitialConfig = async () => {
    try {
      setLoadingInitialData(true);

      const response = await axios.get(
        `${BASE_API_URL}/api/data/initialhoteldata`
      );

      response.data && setInitialConfigData((prevData) => response.data);
      setInitialDataLoaded(true);
      response.data && setComunes(response.data.comunes);
      response.data && setStelles(response.data.stelles);
      response.data && setFascias(response.data?.fascio);
      response.data && setDistances(response.data.distances);
    } catch (err) {
      setLoadingInitialData(false);
      toast.error("Error loading initial props");
      console.log(err);
    }
  };

  const setConfigFromInitialAppState = () => {
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");

    const config = {
      fascio: initialConfigData?.fascio[0],
      distance: initialConfigData.distances[0],
      comune: initialConfigData.comunes[0],
      stelle: initialConfigData.stelles[0],
    };
    if (!checkin || !checkout) {
      config.checkInDate = initialConfigData.dateAfterTwoDays;
      config.checkOutDate = initialConfigData.dateAfterAWeek;

    }

    try {
      const formattedCheckInDate = formatDate(checkin, "checkin");
      const formattedCheckOutDate = formatDate(checkout, "checkout");
      if (formattedCheckInDate > formattedCheckOutDate) {
        throw Error;
      } else {
        config.checkInDate = formattedCheckInDate;
        config.checkOutDate = formattedCheckOutDate;
      }
    } catch (err) {
      config.checkInDate = initialConfigData.dateAfterTwoDays;
      config.checkOutDate = initialConfigData.dateAfterAWeek;
    }

    setConfig(config);
  };

  function isISOString(dateString) {
    // Regular expression to match ISO 8601 date format
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return isoDatePattern.test(dateString);
  }

  function calculateOfferPrice(offer) {
    if (offer.minStay === offer.maxStay) {
      return offer.breakdown[0]?.price || offer.breakdown[1]?.price || offer.breakdown[2]?.price;
    } else {
      const calculatedNights = Math.abs((new Date(config.checkInDate) - new Date(config.checkOutDate)) / (1000 * 60 * 60 * 24));
      const clampedNights = Math.max(offer.minStay, Math.min(calculatedNights, offer.maxStay));

      return (offer.breakdown[0]?.price || offer.breakdown[1]?.price || offer.breakdown[2]?.price) * clampedNights;
    }
  }


  const loadHotels = async () => {
    try {
      setloadingHotels(true);

      const checkCheckIn = isISOString(config.checkInDate)
      const checkCheckOut = isISOString(config.checkOutDate)
      if(!checkCheckIn && !checkCheckOut){
        const parsedInDate = new Date(config.checkInDate)
        const parsedOutDate = new Date(config.checkOutDate)
        config.checkInDate=parsedInDate.toISOString()
        config.checkOutDate=parsedOutDate.toISOString()
      }
      const query_string = String(`${values.url}/app/hotels?startDate=${config.checkInDate}&endDate=${config.checkOutDate}`)
      const result = await axios.get(query_string);
      let tempHotels=result.data;
      function filterOffers(offers, tempStartDate, tempEndDate,tempHotels) {
        const maxDaysDifference = 3;
    
        const requiredNights = Math.abs((new Date(tempEndDate) - new Date(tempStartDate)) / (1000 * 60 * 60 * 24));
    
        return offers
          .filter((offer) => {
            const offerStartDate = new Date(offer.startDate);
            const offerEndDate = new Date(offer.endDate);
            const current = new Date();
            offerStartDate.setHours(0, 0, 0, 0);
            offerEndDate.setHours(0, 0, 0, 0);
            const tempStartDateObj = new Date(tempStartDate);
            const tempEndDateObj = new Date(tempEndDate);
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
                (startDateValid || endDateValid) &&
                specialCase >= numofnights + 1 &&
                (offer.numofnights = numofnights)
              );
            }
          })
      }
      const tempArray = [];
      for(let i=0;i<tempHotels.length;i++){
        tempHotels[i].bestPossiblePrice = 0;
        const offerNum= filterOffers(tempHotels[i].offers,config.checkInDate,config.checkOutDate,tempHotels[i]);
        if(offerNum.length>0){
          tempArray.push(tempHotels[i]);
        }
      }
      setHotels(tempArray);
      setLastChange(null);
    } catch (err) {
      console.log(err);
      setHotels([]);
      toast.error("Error loading hotels");
      setLastChange(null);

      setloadingHotels(false);
    }
  };

  const handleConfigChange = (type, value) => {
    setConfig({ ...config, [type]: value });
    setLastChange(type);
  };

  useEffect(() => {
    if (!initialDataLoaded) {
      loadInitialConfig();
    }
    localStorage.removeItem("prevInDate");
    localStorage.removeItem("prevOutDate");
    localStorage.removeItem("offer");
    localStorage.removeItem("hotel");
  }, []);

  useEffect(() => {
    if (initialConfigData) {
      setLoadingInitialData(false);
      setConfigFromInitialAppState();
    }
  }, [initialConfigData]);

  useEffect(() => {
    if (config) {
      loadHotels().catch((err) => {});
      const checkInDateString = getDateString(config.checkInDate);
      const checkOutDateString = getDateString(config.checkOutDate);
      // setSearchParams(
      //   `?${new URLSearchParams({
      //     startDate: checkInDateString,
      //     endDate: checkOutDateString,
      //   })}`
      // );
    }
  }, [config]);

  useEffect(() => {
    if (hotels) {
      setloadingHotels(false);
    }
  }, [hotels]);

  let newcomunes = [{ name: "Tutta l'isola" }];
  let communeSet = new Set(newcomunes.map(item => item.name));
  
  let newstars = [{name: "Tutti"}]
  let starsSet = new Set(newstars.map(item => item.name));
  
  let newprice = [{name: "Tutti", value: 0}]
  let priceSet = new Set(newprice.map(item => item.name));

  let newdistance = [{name: "Tutti", value: 0}]
  let distanceSet = new Set(newdistance.map(item => item.name));

  hotels.forEach(hotel => {
    if (!communeSet.has(hotel?.state)) {
      communeSet.add(hotel?.state);
      newcomunes.push({ name: hotel?.state });
    }

    let formattedRating = hotel?.rating + " Stelle";
    if (!starsSet.has(formattedRating)) {
      starsSet.add(formattedRating);
      newstars.push({ name: formattedRating });
    }


    if (hotel?.bestPossiblePrice < 40 && !priceSet.has("fino a 40€")) {
      priceSet.add("fino a 40€");
      newprice.push({ name: "fino a 40€", value: newprice.length });
    } else if (hotel?.bestPossiblePrice >= 40 && hotel?.bestPossiblePrice <= 80 && !priceSet.has("tra 40€ e 80€")) {
      priceSet.add("tra 40€ e 80€");
      newprice.push({ name: "tra 40€ e 80€", value: newprice.length });
    } else if (hotel?.bestPossiblePrice > 80 && !priceSet.has("più di 80€")) {
      priceSet.add("più di 80€");
      newprice.push({ name: "più di 80€", value: newprice.length });
    }

    const distFilterKey = "Mare"
    hotel?.distance.map((dist,idx)=>{
      if(dist.label.includes(distFilterKey)){

        let distance = dist?.distance;
        if(dist.scale==="Km"){
          distance = distance * 1000;
        }

        if(distance<=500 && !distanceSet.has("0mt - 500mt")){
          distanceSet.add("0mt - 500mt");
          newdistance.push({ name: "0mt - 500mt", value: newprice.length });
        }
        else if(distance>500 && distance<=1000 && !distanceSet.has("500mt - 1km")){
          distanceSet.add("500mt - 1km");
          newdistance.push({ name: "500mt - 1km", value: newprice.length });
        }
        else if(distance>1000 && !distanceSet.has("1km+")){
          distanceSet.add("1km+");
          newdistance.push({ name: "1km+", value: newprice.length });
        }
      }
    })    
 

  });

  let finalComunes = newcomunes;
  let finalStars = newstars;
  let finalPrice = newprice;
  let finalDistance = newdistance;


  return (
    <>
      <Toaster />
      <Header />
      {loadingInitialData || loadingHotels || !initialConfigData ? (
        <Loading />
      ) : (
        <>
          <Banner
            initialConfigData={initialConfigData}
            comunes={finalComunes}
            stelles={finalStars}
            fascias={fascias}
            distances={finalDistance}
            config={config}
            handleConfigChange={handleConfigChange}
          />
          {hotels.length ? (
            <MainSection
              config={config}
              hotels={hotels}
              setHotels={setHotels}
              checkInDate={config.checkInDate}
              checkOutDate={config.checkOutDate}
              setDatePickerOpen={setDatePickerOpen}
            />
          ) : (
            <h1 style={{ minHeight: "10rem", padding: "2rem",marginBottom : "10rem"}}>
              Nessun hotel trovato
            </h1>
          )}
          <Footer
            setStartEndDate={setStartEndDate}
            comunes={comunes}
            initialConfigData={initialConfigData}
            config={config}
            stelles={stelles}
            setConfig={setConfig}
            datePickerOpen={datePickerOpen}
          />
        </>
      )}
    </>
  );
}

export default Home;
