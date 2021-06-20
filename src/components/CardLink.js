import React from "react";
import "./CardLink.css";
import { linksWithTags, updateCardClicks, deleteLink } from "../api";
import img from "../../src/assests/grid-globe-link.png";
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const CardLink = ({ links, setLinks, reset }) => {
  const handleTags = async (tagName) => {
    try {
      const tagReturn = await linksWithTags(tagName);
      setLinks(tagReturn);
    } catch (err) {
      console.err(err);
    }
  };
  const handleReset = () => {
    reset();
  };

  return links.map((link, index) => {
    return (
      <div className="CardlinkContainer">
        <div className="CardLink" key={index}>
          <div className="cardHeader">
            <img src={img} alt="Globe" id="card-title-img" />
            <button
              onClick={(e) => {
                e.preventDefault();
                deleteLink(link.id);
                handleReset();
              }}
            > 
              <DeleteForeverIcon fontSize='large' color="red" /> 
            </button>
          </div>
          <div className="infoSection">
            <p>{link.name}</p>
            <p>
              Link:
              <a
                href="true"
                onClick={(e) => {
                  e.preventDefault();
                  updateCardClicks(link.id);
                  handleReset();
                  window.open(link.link);
                }}
              >
                {link.link}
              </a>
            </p>
            <p>Comment: {link.comment} </p>
            <p>
              Date Created:<span> {link.dateshared} </span>
            </p>
            <p>
              Clicked: <span> {link.count} </span>
            </p>
            <span className="tagContainer">
              {link.tags.map((tags, index) => {
                return (
                  <button
                    key={index}
                    className="tag"
                    onClick={() => {
                      handleTags(tags.name);
                    }}
                  >
                    #{tags.name}
                  </button>
                );
              })}
            </span>
          </div>
        </div>
      </div>
    );
  });
};

export default CardLink;
