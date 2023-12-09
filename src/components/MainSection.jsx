import React, { useState, useEffect } from "react";
import img1 from "../assets/img/offers/1.png";

import { toast, Toaster } from "react-hot-toast";

import axios from "axios";
import { BASE_API_URL } from "../keys";
import OfferItem from "./OfferItem";
import Shapes from "./Shapes";
import { compileString } from "sass";
const MainSection = ({
  hotels,
  setHotels,
  checkInDate,
  checkOutDate,
  setDatePickerOpen,
  config,
}) => {
  const [userData, setUserData] = useState({
    Nome: "",
    Cognome: "",
    Email: "",
    Phone: "+39",
    postedDate: new Date().toDateString(),
    departure: null,
    bags :null,
    carSize :null,
    arrival: null,
    packageBoard: null,
    rooms: [{ adult: 2, child: 0, childAge: [] }],
    Citta: null,
    note: "",
    Modulo: "infoischia",
    Hotel: null,

    numeroBagagliAlis: "1",
    ferry:
      "traghetto con auto fino 4 mt. da Pozzuoli A/R € 75 - passeggeri € 22",
    trasporto: "",
    numeroBagagliViaggio: "",
    pricePerPerson: "",
    selectedCitta: "",
  });

  const [sending, setSending] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [value, setValue] = useState("");

  const handleUpdateRooms = (room, i) => {
    const updatedRooms = userData.rooms.map((r, index) => {
      if (i === index) return room;
      return r;
    });
    setUserData({ ...userData, rooms: updatedRooms });
  };

  const handleChangeValue = (value) => {};

  
  const [bookings,setBooking] = useState(null);

  const handleSubmit = async (
    arrival,
    departure,
    NomeModulo,
    Hotel,
    totalPriceForUser,
    packageBoard,
    handleScroll,
    handleOfferClose
  ) => {
    if (buttonDisabled) {
      toast.error("Wait for a while");
      return;
    }

    // setButtonDisabled(true);
    const dataToBePosted = {
      ...userData,
      arrival,
      departure,
      NomeModulo: "infoischia",
      Hotel,
      pricePerPerson: totalPriceForUser,
      packageBoard,
    };

    const res1 = await axios.get(
      `https://marco-dashboard-backend-azure.vercel.app/booking/userByEmail?email=${userData.Email}`
    );
    var userId = 0;
    if (res1.data == null) {
      const newUser = await axios.post(
        `https://marco-dashboard-backend-akshat-bhansalis-projects.vercel.app/booking/user`,
        {
          fName: userData.Nome,
          lName: userData.Cognome,
          email: userData.Email,
          phone: userData.Phone,
          lastQuoteSent: new Date(),
          quoteSent: 404,
        }
      );
      userId = newUser.data._id;
    } else {
      userId = res1.data._id;
    }

    if (!userData.Nome) {
      toast.error("Devi inserire name");
      return;
    }
    if (!userData.Cognome) {
      toast.error("Devi inserire  cognome");
      return;
    }
    if (!userData.Email) {
      toast.error("Devi inserire  email");
      return;
    }
    if (!userData.Phone) {
      toast.error("Devi inserire Numero di Telefono");
      return;
    }
    if (!arrival || !arrival.length || arrival?.split("-")[0] === "NaN") {
      toast.error("Devi inserire Data Check In");
      return;
    }
    if (!departure || !departure.length || departure?.split("-")[0] === "NaN") {
      toast.error("Devi inserire  Data Check Out");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

    if (!emailRegex.test(userData.Email)) {
      toast.error("si prega di inserire valido email.");
      return;
    }
    if (!phoneRegex.test(userData.Phone)) {
      toast.error("si prega di inserire valido Numero di Telefono.");
      return;
    }

    if (!value) {
      toast.error("Seleziona una opzione sopra");
      handleScroll();
      return;
    }
    switch (value) {
      case "aliscafo":
        if (!userData.numeroBagagliAlis) {
          toast.error("Devi inserire  Numero di Bagagli");
          return;
        } else
          dataToBePosted.Citta = `Aliscafo + Transfer | ${userData.numeroBagagliAlis}`;
        break;
      case "ferry":
        if (!userData.ferry) {
          toast.error("Devi inserire  Dimensione Auto");
          return;
        } else
          dataToBePosted.Citta = `Traghetto + Transfer | ${userData.ferry}`;
        break;

      case "viaggio":
        dataToBePosted.Citta = `${userData.numeroBagagliViaggio} con ${userData.trasporto}`;
        break;
      default:
        dataToBePosted.Citta = "";
    }
    // {
    //   userId: userId,
    //   msg: userData.note,
    //   tag: [],
    //   date: new Date(),
    //   dateLine: `${userData.arrival?.toDateString()} - ${userData.departure?.toDateString()}`,
    //   periodo: `${new Date(checkOutDate)-new Date(checkInDate)} notti €${localStorage.getItem("priceToBeSent")} per persona`,
    //   module: "customer support",
    //   guestDetails: [
    //     {
    //       adult: userData.rooms.noofAdults,
    //       child: userData.rooms.noofChildren,
    //       childAge: userData.rooms.ages,
    //     },
    //   ],
    //   trasporto: userData.trasporto,
    //   citta: userData.Citta,
    //   periodOfStay: "1 week",
    //   dates: [
    //     {
    //       start: userData.arrival,
    //       end: userData,departure,
    //       price: localStorage.getItem("priceToBeSent"),
    //       hotelName: "Riverfront Retreat",
    //       offerName: "Winter Wonderland Package",
    //     },
    //   ],
    //   boardType: "Mezza Pensione",
    // }
    function formatDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();
    
      // Pad day and month with leading zeros if needed
      const formattedDay = day < 10 ? `0${day}` : day;
      const formattedMonth = month < 10 ? `0${month}` : month;
    
      return `${year}-${formattedMonth}-${formattedDay}`;
    }

    const getMonth =(month) =>{
      if (month === 0) {
        return "gen";
      } else if (month === 1) {
        return "feb";
      } else if (month === 2) {
        return "mar";
      } else if (month === 3) {
        return "apr";
      } else if (month === 4) {
        return "mag"; 
      } else if (month === 5) {
        return "giu"; 
      } else if (month === 6) {
        return "lug"; 
      } else if (month === 7) {
        return "ago"; 
      } else if (month === 8) {
        return "set"; 
      } else if (month === 9) {
        return "ott"; 
      } else if (month === 10) {
        return "nov";
      } else if (month === 11) {
        return "dic"; 
      }
    }
    setSending(true);
    console.log(userData)
    axios
      .post(`https://marco-dashboard-backend-akshat-bhansalis-projects.vercel.app/booking`,{
        "id" : bookings +1,
        "userId":  userId,
        "msg": userData.note,
        "tag": [],
        "date": new Date().toDateString(),
        "dateLine": `${new Date(localStorage.getItem("prevInDate")).getDate()} ${getMonth(new Date(localStorage.getItem("prevInDate")).getMonth())} - ${new Date(localStorage.getItem("prevOutDate")).getDate()} ${getMonth(new Date(localStorage.getItem("prevOutDate")).getMonth())}`,
        "periodo": `${(new Date(localStorage.getItem("prevOutDate")) - new Date(localStorage.getItem("prevInDate")))/86400000} notti ${localStorage.getItem("price")} per persona`,
        "module": userData.Modulo,
        "guestDetails": userData.rooms,
        "trasporto": userData.trasporto?userData.trasporto : "Nessuna",
        "citta": `${userData.Citta? userData.Citta : "Nessuna"}`,
        "periodOfStay": "1 week",
        "bags" : `${userData.bags?userData.bags : "Nessuna"}`,
        "carSize":`${userData.carSize?userData.carSize:"Nessuna"}`,
        "dates": [
          {
            "checkIn" : formatDate(new Date(localStorage.getItem("prevInDate"))),
            "checkOut" : formatDate(new Date(localStorage.getItem("prevOutDate"))),
            "start":`${new Date(localStorage.getItem("prevInDate")).getDate()} ${getMonth(new Date(localStorage.getItem("prevInDate")).getMonth())}`,
            "end": `${new Date(localStorage.getItem("prevOutDate")).getDate()} ${getMonth(new Date(localStorage.getItem("prevOutDate")).getMonth())}`,
            "price": localStorage.getItem("price"),
            "hotelName": `${localStorage.getItem("hotel")}`,
            "offerName": `${localStorage.getItem("offer")}`
          }
        ],
        "boardType": localStorage.getItem("selectedPackage")
      })
      .then((res) => {
        toast.success("Success");
        setSending(false);
        setButtonDisabled(true);
        setBooking(bookings+1);
        setTimeout(() => {
          handleOfferClose();
        }, 8000);
        setTimeout(() => {
          setButtonDisabled(false);
        }, 10000);
        localStorage.removeItem("selectedPackage");
        setUserData({
          Nome: "",
          Cognome: "",
          Email: "",
          Phone: "+39",
          postedDate: new Date().toDateString(),
          departure: null,
          bags :null,
          carSize :null,
          arrival: null,
          packageBoard: null,
          rooms: [{ adult: 2, child: 0, childAge: [] }],
          Citta: null,
          note: "",
          Modulo: "infoischia",
          Hotel: null,
      
          numeroBagagliAlis: "1",
          ferry:
            "traghetto con auto fino 4 mt. da Pozzuoli A/R € 75 - passeggeri € 22",
          trasporto: "",
          numeroBagagliViaggio: "",
          pricePerPerson: "",
          selectedCitta: "",
        })
      })
      .catch((err) => {
        setSending(false);
        console.log(err);
        toast.error(err.response?.data.message || "Internal server error");
      });
  };
  const [filters, setFilters] = useState({
    fascio: { min: 0, max: 5000 },
    distance: { min: 0, max: 5000 },
    stelle: 0,
    comune: "Tutta l'isola",
  });

  useEffect(() => {
    // Make changes to a newFilters object and update filters once at the end
    let newFilters = { ...filters }; // Make a copy of the current filters
    newFilters = {
      ...newFilters,
      comune: config.comune.name,
    };
    if (config.fascio.name === "fino a 40€") {
      newFilters = {
        ...newFilters,
        fascio: { min: 0, max: 40 },
      };
    } else if (config.fascio.name === "tra 40€ e 80€") {
      newFilters = {
        ...newFilters,
        fascio: { min: 40, max: 80 },
      };
    } else if (config.fascio.name === "più di 80€") {
      newFilters = {
        ...newFilters,
        fascio: { min: 80, max: 5000 },
      };
    } else if (config.fascio.name === "Tutti") {
      newFilters = {
        ...newFilters,
        fascio: { min: 0, max: 5000 },
      };
    }

    if (config.stelle.name === "Tutti") {
      newFilters = {
        ...newFilters,
        stelle: 0,
      };
    } else if (config.stelle.name === "2 Stelle") {
      newFilters = {
        ...newFilters,
        stelle: 2,
      };
    } else if (config.stelle.name === "3 Stelle") {
      newFilters = {
        ...newFilters,
        stelle: 3,
      };
    } else if (config.stelle.name === "4 Stelle") {
      newFilters = {
        ...newFilters,
        stelle: 4,
      };
    } else if (config.stelle.name === "5 Stelle") {
      newFilters = {
        ...newFilters,
        stelle: 5,
      };
    }

    if (config.distance.name === "0mt - 500mt") {
      newFilters = {
        ...newFilters,
        distance: { min: 0, max: 500 },
      };
    } else if (config.distance.name === "500mt - 1km") {
      newFilters = {
        ...newFilters,
        distance: { min: 500, max: 1000 },
      };
    } else if (config.distance.name === "1km+") {
      newFilters = {
        ...newFilters,
        distance: { min: 1000, max: 5000 },
      };
    }

    // Update filters only once at the end with all the changes
    setFilters(newFilters);
  }, [config]);

  // const [bestPossiblePrice, setBestPossiblePrice] = useState()
  // console.log(hotels)

  useEffect(() => {
    let tempHotels = hotels.filter((hotel) => {
      let dalMareDistance = hotel?.distance.find((obj) =>
        obj.label.includes("Mare")
      )?.distance;
      if (
        hotel?.distance.find((obj) => obj.label.includes("Mare"))?.scale == "Km"
      ) {
        dalMareDistance = dalMareDistance * 1000;
      }
      if (
        hotel?.bestPossiblePrice <= filters.fascio.max &&
        hotel?.bestPossiblePrice >= filters.fascio.min &&
        (filters.comune == "Tutta l'isola"
          ? 1
          : hotel?.state == filters.comune) &&
        (filters.stelle == 0 ? 1 : filters.stelle == hotel?.rating) &&
        (dalMareDistance
          ? dalMareDistance >= filters.distance.min &&
            dalMareDistance <= filters.distance.max
          : 1)
      ) {
        return hotel;
      }
    });

    setHotels(tempHotels);
    // console.log("Filtered Hotels :: ", hotels);
  }, [filters]);

  useEffect(()=>{

    axios.get(`https://marco-dashboard-backend-azure.vercel.app/booking`) 
    .then(response => {
      setBooking(response.data.length);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  },[])

  return (
    <>
      <section className="main-section">
        <Toaster />
        <div className="shapes">
          <Shapes />
        </div>
        <div className="container">
          <h3 className="text-base font-medium m-title">
            Le migliori offerte per te!
          </h3>
          <div className="d-flex flex-column gap-36">
            {hotels.slice(0, 2).map((hotel, i) => {
              // let bestPossiblePrice = 10000;
              // hotel.offers?.map((item, id) => {
              //   if (item?.minStay === item?.maxStay) {
              //     const myVar =
              //       item?.breakdown[0]?.price ||
              //       item?.breakdown[1]?.price ||
              //       item?.breakdown[2]?.price;
              //     if (bestPossiblePrice > myVar) {
              //       bestPossiblePrice = myVar;
              //     }
              //   } else {
              //     let calculatedNights = Math.abs(
              //       (new Date(checkInDate) - new Date(checkOutDate)) /
              //       (1000 * 60 * 60 * 24)
              //     );
              //     if (calculatedNights < item?.minStay) {
              //       calculatedNights = item.minStay;
              //     } else if (calculatedNights > item?.maxStay) {
              //       calculatedNights = item.maxStay;
              //     }
              //     const myVar2 =
              //       (item?.breakdown[0]?.price ||
              //         item?.breakdown[1]?.price ||
              //         item?.breakdown[2]?.price) * calculatedNights;

              //     if (bestPossiblePrice > myVar2) {
              //       bestPossiblePrice = myVar2;
              //     }
              //   }
              //   hotel.bestPossiblePrice = bestPossiblePrice;
              // });
              let dalMareDistance = hotel?.distance.find((obj) =>
                obj.label.includes("Mare")
              )?.distance;
              if (
                hotel?.distance.find((obj) => obj.label.includes("Mare"))
                  ?.scale == "Km"
              ) {
                dalMareDistance = dalMareDistance * 1000;
              }

              return (
                <>
                  <OfferItem
                    config={config}
                    // bestPossiblePrice={bestPossiblePrice}
                    // setBestPossiblePrice={setBestPossiblePrice}
                    setUserData={setUserData}
                    userData={userData}
                    sending={sending}
                    setvalue={setValue}
                    value={value}
                    handleSubmit={handleSubmit}
                    buttonDisabled={buttonDisabled}
                    handleUpdateRooms={handleUpdateRooms}
                    offer
                    key={i}
                    index={i + 1}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    setDatePickerOpen={setDatePickerOpen}
                    hotel={{ ...hotel, img: [img1, img1, img1] }}
                  />
                </>
              );
            })}
          </div>
          <br />
          <br />
          {hotels.length > 2 ? (
            <h3 className="text-base font-medium m-title">
              Ecco altre offerte che ti potrebbero piacere.
            </h3>
          ) : (
            <></>
          )}
          {hotels.slice(2).map((hotel, i) => {
            // let bestPossiblePrice = 10000;
            // hotel.offers?.map((item, id) => {
            //   if (item?.minStay === item?.maxStay) {
            //     const myVar =
            //       item?.breakdown[0]?.price ||
            //       item?.breakdown[1]?.price ||
            //       item?.breakdown[2]?.price;
            //     if (bestPossiblePrice > myVar) {
            //       bestPossiblePrice = myVar;
            //     }
            //   } else {
            //     let calculatedNights = Math.abs(
            //       (new Date(checkInDate) - new Date(checkOutDate)) /
            //       (1000 * 60 * 60 * 24)
            //     );
            //     if (calculatedNights < item?.minStay) {
            //       calculatedNights = item.minStay;
            //     } else if (calculatedNights > item?.maxStay) {
            //       calculatedNights = item.maxStay;
            //     }
            //     const myVar2 =
            //       (item?.breakdown[0]?.price ||
            //         item?.breakdown[1]?.price ||
            //         item?.breakdown[2]?.price) * calculatedNights;

            //     if (bestPossiblePrice > myVar2) {
            //       bestPossiblePrice = myVar2;
            //     }
            //   }
            //   hotel.bestPossiblePrice = bestPossiblePrice;
            // });

            let dalMareDistance = hotel?.distance.find((obj) =>
              obj.label.includes("Mare")
            )?.distance;
            if (
              hotel?.distance.find((obj) => obj.label.includes("Mare"))
                ?.scale == "Km"
            ) {
              dalMareDistance = dalMareDistance * 1000;
            }
            return (
              <div style={{ marginTop: "2rem" }}>
                <OfferItem
                  setUserData={setUserData}
                  userData={userData}
                  sending={sending}
                  setvalue={setValue}
                  value={value}
                  // bestPossiblePrice={bestPossiblePrice}
                  // setBestPossiblePrice={setBestPossiblePrice}
                  handleSubmit={handleSubmit}
                  handleUpdateRooms={handleUpdateRooms}
                  buttonDisabled={buttonDisabled}
                  offer={false}
                  key={i}
                  index={i + "--" + 1}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  setDatePickerOpen={setDatePickerOpen}
                  hotel={{ ...hotel, img: [img1, img1, img1] }}
                />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default MainSection;
