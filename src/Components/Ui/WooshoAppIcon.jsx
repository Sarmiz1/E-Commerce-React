import dark_icon from "../../assets/logos/woosho_logo_Icon_dark.png";
import light_icon from "../../assets/logos/woosho_logo_Icon_light.png";

const WooshoAppIcon = ({ explicitDark, size = 10 }) => {
  return (
    <img
      src={explicitDark ? dark_icon : light_icon}
      alt="Woosho icon"
      className={`object-contain`}
      style={{ width: size * 4, height: size * 4 }}
    />
  );
};

export default WooshoAppIcon;
