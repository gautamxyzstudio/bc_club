import { styled } from "@mui/material/styles";
import Slider from "@mui/material/Slider";

// ================= Slider Theme =================
export const PriceSlider = styled(Slider)({
  color: "#E8A200",
  height: 6,
  padding: "14px 0",

  "& .MuiSlider-thumb": {
    height: 18,
    width: 18,
    backgroundColor: "#E8A200",
    border: "3px solid #fff",
    boxShadow: "0 2px 6px rgba(0,0,0,.25)",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&::before": {
      display: "none",
    },
  },
  "& .MuiSlider-track": {
    height: 12,
  },

  "& .MuiSlider-rail": {
    height: 12,
    opacity: 1,
    backgroundColor: "#e5e5e5",
    borderRadius: 10,
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: "0 10px",
    width: "fit-content",
    height: 32,
    borderRadius: 20,
    backgroundColor: "#E8A200",
    transform: "translate(0%, 10%) rotate(180deg) scale(0)",
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(0%, 10%) rotate(180deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(180deg)",
    },
  },
});

// Helper to abbreviate price (e.g. $1.2M, $649K)
export function formatPriceAbbreviated(price: number) {
  if (!price) return "$0";
  if (price >= 1000000) {
    return "$" + (price / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (price >= 1000) {
    return "$" + Math.round(price / 1000) + "K";
  }
  return "$" + price.toLocaleString();
}
