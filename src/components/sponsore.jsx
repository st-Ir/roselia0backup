import React from "react";

const Sponsor = () => {
  const logoContainerStyle = {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    boxSizing: "border-box",
  };

  const logoStyle = {
    height: "50px",
    margin: "10px",
    opacity: 0.7,
    transition: "all 0.3s ease",
  };

  const hoverStyle = {
    opacity: 1,
    transform: "scale(1.05)",
  };

  return (
    <div style={logoContainerStyle}>
      <img src="../src/assets/1.png" alt="Sponsor 1" style={logoStyle} />
      <img src="../src/assets/2.png" alt="Sponsor 2" style={logoStyle} />
      <img src="../src/assets/3.png" alt="Sponsor 3" style={logoStyle} />
    </div>
  );
};

export default Sponsor;
