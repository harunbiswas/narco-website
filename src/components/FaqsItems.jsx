import React, { useState } from "react";
import { CheckIcon, Minus, Plus } from "./Icon";

export const FaqsItems = ({ data, id }) => {
  const [open, setOpen] = useState(0);
  const sex = [
    { agelimit: 0, discount: 0 },
    { agelimit: 2, discount: -50 },
    { agelimit: 4, discount: -20 },
  ];

  return (
    <div className="accordion" id={id}>
      {Array.isArray(data) &&
        data?.map(
          (
            {
              title,
              paragraph,
              text,
              data,
              supliment,
              icon,

              
              hotelDescriptionProps, 
              serviceTitle,
              serviceDetails,
            },
            i
          ) => (
            <>
              {paragraph && (
                <div className="accordion-item" key={i}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#accordion-${id}-${i}`}
                      aria-expanded="true"
                      onClick={() => {
                        i == open ? setOpen(null) : setOpen(i);
                      }}
                    >
                      {/* data-bs-toggle="collapse" data-bs-target="#collapseOne"
							aria-expanded="true" ="collapseOne" */}
                      <span className="me-2">{title} </span>
                      <span className="plus ms-auto">
                        {open !== i ? <Plus /> : <Minus />}
                      </span>
                    </button>
                  </h2>
                  <div
                    id={`accordion-${id}-${i}`}
                    className={`accordion-collapse collapse ${
                      i == 0 ? "show" : ""
                    }`}
                    data-bs-parent={`#${id}`}
                  >
                    <div className="accordion-body">
                      {title === "Pacchetto Incluso" ? (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: paragraph.split("-").join("<br>"),
                          }}
                        ></p>
                      ) : (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: paragraph !== true ? paragraph : "",
                          }}
                        ></p>
                      )}
                      {text?.length ? (
                        <ul>
                          {text?.map((item, i) => (
                            <li key={i}>
                              <CheckIcon /> {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <></>
                      )}
                      {supliment && supliment.length && (
                        <ul>
                          {supliment?.map((item, i) => (
                            <li key={i}>
                              <p>
                                {item?.name} - {item?.price}
                                {item?.currency || "€"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {hotelDescriptionProps?.map((descAttribute, id)=>{
                        return (
                          descAttribute.title && descAttribute.description && <div key={id}>
                            <div className="detatagli-servizi">{descAttribute.title} </div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: descAttribute.description !== true ? descAttribute.description : "",
                              }}
                            ></div>
                          </div>
                        )
                      })}
                      <button className="detatagli-servizi">{serviceTitle} </button>
                      {serviceDetails && (
                        <p
                          dangerouslySetInnerHTML={{
                            __html: serviceDetails !== true ? serviceDetails : "",
                          }}
                        ></p>
                      )}

                      {data && data.length > 0 && (
                        <ul>
                          {data.map((item, i) => {
                            let ageRangeStart = 0;
                            if (i > 0) {
                              ageRangeStart = data[i - 1]?.agelimit;
                            }

                            const ageRangeEnd = item?.agelimit - 0.01;
                            const discountValue = Math.abs(item?.discount);

                            let discountInfo = "";
                            if (item?.discount) {
                              if (discountValue == 100) {
                                discountInfo = "Gratis";
                              }
                              else if (discountValue > 0) {
                                discountInfo = `${discountValue}% di sconto`;
                              } 
                               
                              else{
                                discountInfo = `${discountValue}€ al giorno`;
                              }
                            }

                            return (
                              <li key={i}>
                                {`Bambini da ${ageRangeStart} a ${ageRangeEnd}: ${discountInfo}`}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
    </div>
  );
};

export default FaqsItems;
