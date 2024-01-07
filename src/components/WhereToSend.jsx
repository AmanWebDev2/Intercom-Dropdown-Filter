import { useEffect, useState } from "react";

import { Dropdown, OverlayTrigger, Form, Popover } from "react-bootstrap";

import { attributes, dropdownMenu } from "../data/data";
import cross from "../assets/cross.svg";
import add from "../assets/add.svg";
import link from "../assets/link.svg";

const WhereToSend = () => {
  const [predicates, setPredicates] = useState([]);

  useEffect(() => {
    console.log("useeffect", predicates);
  }, [predicates]);

  const handlePredicate = (
    type,
    newPredicate,
    currentPredicate,
    groupIndex
  ) => {
    const id = Math.floor(Math.random() * 10000);
    const newPredicateWithID = { ...newPredicate, id, comparison: "eq"};

    if (type === "nested") {
      const temp = JSON.parse(JSON.stringify(([...predicates])));
      console.log("before", temp);
      if (
        Array.isArray(currentPredicate) ||
        Array.isArray(currentPredicate?.predicate)
      ) {
        const predObj = { ...currentPredicate };
        predObj.predicate.push(newPredicateWithID);
        const temp = [...predicates];
        temp.splice(groupIndex, 1, predObj);
        console.log(temp);
        setPredicates([...temp]);
      } else {
        const index = predicates.findIndex(
          (pred) => pred.id == currentPredicate.id
        );
        const copiedPredicate = temp[index];
        const pred = {
          predicate: [copiedPredicate, newPredicateWithID],
          type: "and",
        };
        temp.splice(index, 1, pred);
        setPredicates([...temp]);
      }
    } else {
      setPredicates([...predicates, { ...newPredicateWithID }]);
    }
  };

  return (
    <div className="container">
      <strong>Where to send</strong>

      <div>
        <PredicatesRep
          predicates={predicates}
          setPredicates={setPredicates}
          handlePredicate={handlePredicate}
        />
      </div>

      <div className="page-rule">
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Add page rule
          </Dropdown.Toggle>
          <AddRule handlePredicate={handlePredicate} />
        </Dropdown>
      </div>
    </div>
  );
};

const PredicatesRep = ({ predicates, setPredicates, handlePredicate }) => {
  // tracking the active predicate
  const [active, setActive] = useState(null);

  useEffect(() => {
    // console.log(active);
  }, [active]);

  const popover = () => {
    const dropdownData = dropdownMenu.find(
      (item) => item.attribute === active?.attribute
    );
    if (!dropdownData) return;
    const comparison = dropdownData.comparison;
    const handleChange = (e, comp) => {
      const { pos } = active;
      if (pos.nestedIndex !== -1) {
        const predicatesTemp = JSON.parse(JSON.stringify([...predicates]));
        const nestedPredicateObj = predicatesTemp[pos.groupIndex];
        const activeIndex = nestedPredicateObj.predicate.findIndex(
          (pre) => pre.id === active.id
        );
        // remove pos from newActive
        const newActive = { ...active, comparison: Object.keys(comp)[0] };
        const newActiveClone = JSON.parse(JSON.stringify({ ...newActive }));
        delete newActiveClone.pos;
        nestedPredicateObj.predicate.splice(activeIndex, 1, newActiveClone);
        setActive(newActive);
        console.log(predicatesTemp, nestedPredicateObj);
        predicatesTemp.splice(pos.groupIndex, 1, nestedPredicateObj);
        setPredicates([...predicatesTemp]);
      } else {
        const activeIndex = predicates.findIndex((pre) => pre.id === active.id);
        const newActive = { ...active, comparison: Object.keys(comp)[0] };
        const predicatesTemp = [...predicates];
        predicatesTemp.splice(activeIndex, 1, newActive);
        setActive(newActive);
        setPredicates([...predicatesTemp]);
      }
    };

    return (
      <Popover id="popover-basic">
        <Popover.Body>
          <div>
            <Form>
              {active &&
                comparison.map((item, i) => {
                  return (
                    <div key={i}>
                      <Form.Check // prettier-ignore
                        type="radio"
                        id={Object.keys(item)}
                        label={Object.values(item)}
                        name="filter"
                        checked={active.comparison === Object.keys(item)[0]}
                        onChange={(e) => handleChange(e, item)}
                      />

                      {active.comparison === Object.keys(item)[0] && (
                        <div className="container">
                          <input type="text" name="" id="" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </Form>
          </div>
        </Popover.Body>
      </Popover>
    );
  };

  const handleDeletePredicate = (pred, { groupIndex, nestedIndex }) => {
    const predicatesTemp = [...predicates];
    // const activeIndex = predicatesTemp.findIndex((p) => p.id ?  p.id === pred.id : -1);
  
    if (nestedIndex !== -1) {
      const nestedPredicateObj = predicatesTemp[groupIndex];
      const nestedPredicate = nestedPredicateObj.predicate;
      nestedPredicate.splice(nestedIndex, 1);
      if (nestedPredicate.length == 1) {
        const pred = nestedPredicate[0];
        predicatesTemp.splice(groupIndex, 1, pred);
        setPredicates([...predicatesTemp]);
      } else {
        predicatesTemp.splice(groupIndex, 1, nestedPredicateObj);
        setPredicates([...predicatesTemp]);
      }
    } else {
      predicatesTemp.splice(groupIndex, 1);
    }
    setPredicates([...predicatesTemp]);
  };

  const handleAddPredicateButton = (
    event,
    newpredicate,
    currentPredicate,
    groupIndex
  ) => {
    console.log(event, newpredicate, currentPredicate);
    handlePredicate("nested", newpredicate, currentPredicate, groupIndex);
  };

  return (
    <>
      <span className="d-flex align-items-center flex-wrap gap-3 my-4 ">
        {predicates.map((item, groupIndex) => {
          if (Array.isArray(item?.predicate)) {
            return item.predicate.map((nestedPredicate, index) => {
              return (
                <div
                  data-position={JSON.stringify({
                    groupIndex,
                    nestedIndex: index,
                  })}
                  className="d-flex align-items-center justify-content-center"
                >
                  <div
                    className="filter-block filter-block__clickable d-flex align-items-center justify-content-center"
                    key={index}
                    data-id={index}
                  >
                    <OverlayTrigger
                      onToggle={(f) => {
                        if (!f) {
                          setActive(null);
                        } else {
                          setActive({
                            ...nestedPredicate,
                            pos: { groupIndex, nestedIndex: index },
                          });
                        }
                      }}
                      show={active ? active.id === nestedPredicate.id : false}
                      trigger="click"
                      placement="bottom"
                      transition={false}
                      rootClose={true}
                      overlay={active ? popover() : <></>}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="cover">
                          <span className="filter-block__icon">
                            <img src={link} alt="link" />
                            &nbsp;{nestedPredicate.readable}
                          </span>
                        </div>
                        <p className="filter-block__deatils">
                          &nbsp;{" "}
                          {nestedPredicate.comparison +
                            " " +
                            nestedPredicate.value}
                        </p>
                        {/* cancel button */}
                        <div
                          className="filter-block__delete"
                          onClick={() =>
                            handleDeletePredicate(nestedPredicate, {
                              groupIndex,
                              nestedIndex: index,
                            })
                          }
                        >
                          <img src={cross} alt="cross-icon" />
                        </div>
                      </div>
                    </OverlayTrigger>
                  </div>
                  {index === item.predicate.length - 1 && (
                    <AddOnPredicate
                      handlePredicate={(event, newPredicate) =>
                        handleAddPredicateButton(
                          event,
                          newPredicate,
                          item,
                          groupIndex
                        )
                      }
                    />
                  )}
                  {index < item.predicate.length - 1 && (
                    <Dropdown style={{ marginLeft: "1rem" }}>
                      <Dropdown.Toggle className="" id="dropdown-basic">
                        {item.type}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item> and </Dropdown.Item>
                        <Dropdown.Item>or</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              );
            });
          } else {
            return (
              <div
                className="filter-block filter-block__clickable d-flex align-items-center justify-content-center"
                key={groupIndex}
                data-id={groupIndex}
              >
                <OverlayTrigger
                  onToggle={(f) => {
                    console.log(f);
                    if (!f) {
                      setActive(null);
                    } else {
                      setActive({
                        ...item,
                        pos: { groupIndex, nestedIndex: -1 },
                      });
                    }
                  }}
                  show={active ? active.id === item.id : false}
                  trigger="click"
                  placement="bottom"
                  transition={false}
                  rootClose={true}
                  overlay={
                    active ? popover({ groupIndex, nestedIndex: -1 }) : <></>
                  }
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="cover">
                      <span className="filter-block__icon">
                        <img src={link} alt="link" />
                        &nbsp;{item.readable}
                      </span>
                    </div>
                    <p className="filter-block__deatils">
                      &nbsp; {item.comparison + " " + item.value}
                    </p>
                    {/* cancel button */}
                    <div
                      className="filter-block__delete"
                      onClick={() =>
                        handleDeletePredicate(item, {
                          groupIndex,
                          nestedIndex: -1,
                        })
                      }
                    >
                      <img src={cross} alt="cross-icon" />
                    </div>
                  </div>
                </OverlayTrigger>
                {/* add button with a logic */}
                <AddOnPredicate
                  handlePredicate={(event, newPredicate) =>
                    handleAddPredicateButton(
                      event,
                      newPredicate,
                      item,
                      groupIndex
                    )
                  }
                />
              </div>
            );
          }
        })}
      </span>
    </>
  );
};

function AddOnPredicate({ handlePredicate }) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="u__left filter-group__add-button-wrapper u__left filter-group__add-button"
        id="dropdown-basic"
      >
        <img src={add} alt="add-icon" />
      </Dropdown.Toggle>

      <AddRule handlePredicate={handlePredicate} />
    </Dropdown>
  );
}

const AddRule = ({ handlePredicate }) => {
  return (
    <>
      <Dropdown.Menu>
        {attributes.map((item, i) => {
          return (
            <div key={i}>
              <Dropdown.Item onClick={(e) => handlePredicate(e, item)}>
                {item.readable}
              </Dropdown.Item>
            </div>
          );
        })}
      </Dropdown.Menu>
    </>
  );
};
export default WhereToSend;
