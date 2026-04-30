import dark_icon from "../../assets/logos/woosho_logo_Icon_dark.png";
import light_icon from "../../assets/logos/woosho_logo_Icon_light.png";

const WooshoAppIcon = ({ explicitDark }) => {
  return (
    <img
      src={explicitDark ? dark_icon : light_icon}
      alt="Woosho icon"
      className="w-10 h-10 object-contain"
    />
  );
};

export default WooshoAppIcon;
