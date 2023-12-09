import React, { useEffect, useState } from "react";
import { AngleDown, AngleUp } from "./Icon";

function SelectDropDown({ selectedOption, selectItems, handleChange }) {
  const [activeSelectIndex, setActiveSelectIndex] = useState(selectedOption);
  const [selectOpen, setSelectOpen] = useState(false);

  if (!selectItems) return <></>;


  return (
    <h6 className="pointer">
      <p onClick={() => setSelectOpen(!selectOpen)}>{(selectItems.find((item) => { if (item.breakdownId === selectedOption) return item.name }))?.name}</p>
      {selectedOption > 0 ? (
        <>
          {selectOpen ? (
            <span className="relative">
              <span onClick={() => setSelectOpen(false)}>
                <AngleUp color="var(--title)" />
              </span>

              <ul className="bg-white rounded-md absolute p-2 top-8 left-[-12rem] w-[14rem]">
                {selectItems?.map((item, i) => (
                  item?.price != 0 && <li
                    className="breakdown-selector"
                    key={selectItems[i].breakdownId}
                    onClick={() => {
                      setActiveSelectIndex(i);
                      handleChange(selectItems[i].breakdownId);
                      setSelectOpen(false);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </span>
          ) : selectItems.length > 1 ? (
            <span onClick={() => setSelectOpen(true)}>
              <AngleDown color="var(--title)" />
            </span>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </h6>
  );
}

export default SelectDropDown;
