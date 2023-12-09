import React from "react";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { DistanzaDalMare, InternalConv, LocationTwo } from "./Icon";

const DistanzaSlider = ({ distanzaData }) => {
  const icons = [
    { icon: <LocationTwo /> },
    { icon: <DistanzaDalMare /> },
    { icon: <InternalConv /> },
  ];

  // Sort the distanzaData array according to custom conditions
  const sortedData = distanzaData.slice().sort((a, b) => {
    const order = {
      "Distanza dal Centro": 1,
      "Distanza dal Mare": 2,
      "Distanza dalle Terme": 3,
    };

    const labelA = a.label;
    const labelB = b.label;

    if (order[labelA] || order[labelB]) {
      if (order[labelA] && order[labelB]) {
        return order[labelA] - order[labelB];
      } else if (order[labelA]) {
        return -1;
      } else {
        return 1;
      }
    }

    // If neither label matches, retain the original order
    return distanzaData.indexOf(a) - distanzaData.indexOf(b);
  });

  return (
    <Swiper
    slidesPerView={1.4}
    spaceBetween={12}
    modules={[Pagination, Navigation]}
    pagination={{ clickable: true }}
    breakpoints={{
      640: {
        slidesPerView: 2,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 12,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 12,
      },
    }}
    >
      {sortedData.slice(0, 3).map((item, i) => (
        <SwiperSlide key={i}>
          <div className="destanza-slide-item">
            <div className="icon">{icons[i].icon}</div>
            <h5>{item?.distance + " " + item?.scale}</h5>
            <div>{item?.label}</div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DistanzaSlider;
