import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";
import { attributes, dropdownMenu } from "../data/data";

const data = [
  {
    name: "button1",
    type: 1,
  },
  {
    name: "button 2",
    type: 2,
  },
  {
    name: "button 3",
    type: 1,
  },
  {
    name: "button 4",
    type: 2,
  },
];

const Demo = () => {
  const [active, setActive] = useState(null);
  // console.log(attributes);
  const pop = () => {
    return (
      <Popover id="popover-basic">
        <Popover.Body>
          <div>
            <div>
              {dropdownMenu[(active && active.type==1) ? 0:1].comparison.map((item, i) => {
                console.log(item);
                return (
                  <div key={i}>
                    <label
                      htmlFor={Object.keys(item)}
                      className="d-flex align-items-center gap-1"
                    >
                      <div>
                        <input
                          type="radio"
                          name="filter"
                          id={Object.keys(item)}
                        />
                      </div>
                      <span>{Object.values(item)}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </Popover.Body>
      </Popover>
    );
  };
  // const popover = (
  //   <Popover id="popover-basic">
  //     <Popover.Body>
  //       <div>
  //         <div>
  //           { active && dropdownMenu.find(item=>item.attribute===active?.attribute).comparison.map((item, i) => {
  //             console.log(item);
  //             return (
  //               <div key={i}>
  //                 <label
  //                   htmlFor={Object.keys(item)}
  //                   className="d-flex align-items-center gap-1"
  //                 >
  //                   <div>
  //                     <input
  //                       type="radio"
  //                       name="filter"
  //                       id={Object.keys(item)}
  //                     />
  //                   </div>
  //                   <span>{Object.values(item)}</span>
  //                 </label>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </Popover.Body>
  //   </Popover>
  // );


  return (
    <div className="container mt-4 mb-5">
      <strong> DEMO </strong>
      <div className="">
        <span>
          <div className="">
            <span className="d-flex align-items-center justify-content-center gap-3">
              {data.map((e, i) => {
                return (
                  <div className="" key={i}>
                    <OverlayTrigger
                      onToggle={(f) => {
                        console.log(f);
                        if (!f) {
                          setActive(null);
                        } else {
                          setActive(e);
                        }
                      }}
                      show={active ? active.name === e.name : false}
                      trigger="click"
                      placement="bottom"
                      transition={false}
                      rootClose={true}
                      overlay={active ? pop() : <></>}
                    >
                      <Button variant="success">{e.name}</Button>
                    </OverlayTrigger>
                  </div>
                );
              })}
            </span>
          </div>
        </span>
      </div>
    </div>
  );
};
export default Demo;
