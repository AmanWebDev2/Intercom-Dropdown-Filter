import { useEffect, useState } from "react";

import { Dropdown, OverlayTrigger, Form, Popover } from "react-bootstrap";

import { attributes, comparison, dropdownMenu } from "../data/data";
import Cross from "../assets/svg/Cross";
import Link from "../assets/svg/Link";
import Add from "../assets/svg/Add";

const WhereToSend = () => {
  const [predicates, setPredicates] = useState([]);

  useEffect(() => {
    console.log(predicates);
  }, [predicates]);

  const handlePredicate = (
    type,
    newPredicate,
    currentPredicate,
    groupIndex
  ) => {
    const id = Math.floor(Math.random() * 10000);
    const newPredicateWithID = { ...newPredicate, id, comparison: "eq" };

    if (type === "nested") {
      const temp = JSON.parse(JSON.stringify([...predicates]));
      // console.log("before", temp);
      if (
        Array.isArray(currentPredicate) ||
        Array.isArray(currentPredicate?.predicate)
      ) {
        const predObj = { ...currentPredicate };
        predObj.predicate.push(newPredicateWithID);
        const temp = [...predicates];
        temp.splice(groupIndex, 1, predObj);
        // console.log(temp);
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
    <div className="container my-5">
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
        // console.log(predicatesTemp, nestedPredicateObj);
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

    const handleInputChange = (e) => {
      // console.log(active);
      const { pos } = active;
      const { groupIndex, nestedIndex } = pos;
      const updatedCurrentPred = { ...active };
      delete updatedCurrentPred.pos;
      updatedCurrentPred.value = e.target.value;

      const temp = JSON.parse(JSON.stringify(predicates));
      if (nestedIndex == -1) {
        // group
        temp.splice(groupIndex, 1, updatedCurrentPred);
        setPredicates([...temp]);
      } else {
        const nestedPredObj = temp[groupIndex];
        nestedPredObj.predicate[nestedIndex].value = e.target.value;
        setPredicates([...temp]);
      }
    };

    return (
      <Popover id="filter-popover">
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

                      {active.comparison === Object.keys(item)[0] &&
                        active.comparison != "unknown" &&
                        active.comparison != "known" && (
                          <div className="container">
                            <Form.Control
                              className="filter-input"
                              type="text"
                              id="filter-text"
                              aria-describedby="filter-text"
                              autoFocus
                              defaultValue={active.value}
                              onChange={handleInputChange}
                            />
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
    // console.log(event, newpredicate, currentPredicate);
    handlePredicate("nested", newpredicate, currentPredicate, groupIndex);
  };

  const handleFilterConnectionSwitcher = (type, pos) => {
    console.log(type, pos);
    const { groupIndex, nestedIndex } = pos;
    const temp = JSON.parse(JSON.stringify(predicates));
    if (nestedIndex !== -1) {
      temp[groupIndex].type = type;
      setPredicates([...temp]);
    } else {
      // if(type!=="or") {
      //   return
      // }
      // const newPredicate = [
      //   {
      //     predicate: temp,
      //     type,
      //   },
      // ];
      // console.log(newPredicate);
      // setPredicates([...newPredicate]);
    }
  };

  return (
    <>
      <span className="d-flex align-items-center flex-wrap my-4 ">
        {

        }
        {predicates.map((item, groupIndex) => {
          if (Array.isArray(item?.predicate)) {
            return (
              <>
                {item.predicate.map((nestedPredicate, index) => {
                  return (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      key={index}
                    >
                      <div
                        data-position={JSON.stringify({
                          groupIndex,
                          nestedIndex: index,
                        })}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <div
                          className="filter-block filter-block__clickable d-flex align-items-center justify-content-center"
                          data-id={index}
                        >
                          <OverlayTrigger
                            popperConfig={{
                              modifiers: [
                                {
                                  name: "offset",
                                  options: {
                                    offset: [0, 8],
                                  },
                                },
                              ],
                            }}
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
                            show={
                              active ? active.id === nestedPredicate.id : false
                            }
                            trigger="click"
                            placement="bottom"
                            transition={false}
                            rootClose={true}
                            overlay={active ? popover() : <></>}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="cover">
                                <span className="filter-block__icon">
                                  <Link />
                                  &nbsp;{nestedPredicate.readable}
                                </span>
                              </div>
                              <p className="filter-block__deatils">
                                &nbsp;{" "}
                                {comparison.get(nestedPredicate.comparison) +
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
                                <Cross />
                              </div>
                            </div>
                          </OverlayTrigger>
                        </div>
                        {/* add predicate */}
                        {/* <pre>{groupIndex +"--"+ +(predicates.length-1)}</pre> */}

                        {index == item.predicate.length - 1 && (
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
                      </div>
                      {index < item.predicate.length - 1 && (
                        <FilterConnectionSwitcher
                          item={item}
                          handleSelect={(type) => {
                            handleFilterConnectionSwitcher(type, {
                              groupIndex,
                              index,
                            });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                {predicates.length > 1 &&
                  predicates.length - 1 !== groupIndex && (
                    <>
                    <FilterConnectionSwitcher
                      item={predicates[0].type}
                      handleSelect={(type) => {
                        handleFilterConnectionSwitcher(type, {
                          groupIndex,
                          nestedIndex: -1,
                        });
                      }}
                      newClass={`filter-connection__seperate-group`}
                    />
                    </>
                  )}
              </>
            );
          } else {
            return (
              <div
                className="d-flex align-items-center align-items-center"
                key={groupIndex}
              >
                <div
                  className="filter-block filter-block__clickable d-flex align-items-center justify-content-center"
                  data-id={groupIndex}
                >
                  <OverlayTrigger
                    popperConfig={{
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 14],
                          },
                        },
                      ],
                    }}
                    onToggle={(f) => {
                      if (!f) {
                        setActive(null);
                      } else {
                        setActive({
                          ...item,
                          pos: { groupIndex, nestedIndex: -1 },
                        });
                      }
                    }}
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
                          <Link />
                          &nbsp;{item.readable}
                        </span>
                      </div>
                      <p className="filter-block__deatils">
                        &nbsp;{" "}
                        {comparison.get(item.comparison) + " " + item.value}
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
                        <Cross />
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
                {/* <pre>{groupIndex +"--"+ +(predicates.length-1)}</pre> */}
                {groupIndex < predicates.length - 1 &&
                  (groupIndex !== 1 || groupIndex !== 0) && (
                    <FilterConnectionSwitcher
                      item={item}
                      handleSelect={(type) => {
                        handleFilterConnectionSwitcher(type,{groupIndex,nestedIndex:-1})
                      }}
                      newClass={`filter-connection__seperate-group`}
                    />
                  )}
              </div>
            );
          }
        })}
      </span>
    </>
  );
};

const FilterConnectionSwitcher = ({ item, handleSelect, newClass }) => {
  console.log(item);
  return (
    <Dropdown>
      <Dropdown.Toggle
        className={`filter-group__connection-switcher__label ${newClass}`}
        id="dropdown-basic"
      >
        {item.type == "or" ? "or" : "and"}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {["and", "or"].map((item, i) => (
          <Dropdown.Item key={i} onClick={() => handleSelect(item)}>
            {" "}
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

function AddOnPredicate({ handlePredicate }) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        className="u__left filter-group__add-button-wrapper u__left filter-group__add-button"
        id="dropdown-basic"
      >
        <Add />
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
