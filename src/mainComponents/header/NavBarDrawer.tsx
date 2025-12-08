import { Drawer } from "@mui/material";
import React from "react";
import { menulist } from "./Header";
import Link from "next/link";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import CustomButton from "@/src/components/button/CustomButton";

type INavBarDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const NavBarDrawer: React.FC<INavBarDrawerProps> = ({ open, onClose }) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      PaperProps={{
        width: "100%",
        backgroundColor: "transparent",
      }}
      sx={{
        zIndex: 99,
        backgroundColor: "transparent",
        "@media(max-width: 1210px)": {
          display: "block",
        },
        "& .MuiDrawer-paper": {
          width: " 100%",
        },
      }}
    >
      <nav className="w-full h-full flex flex-col justify-between md:pt-25 pt-22 md:px-13 px-6 md:pb-10 pb-5 bg-opacity-50 overflow-scroll backdrop-blur-lg">
        <ul className="list-none m-0">
          {menulist.map((item, idx) => (
            <React.Fragment key={idx}>
              <Link
                href={item.href}
                onClick={onClose}
                className="text-foreground text-base uppercase hover:font-semibold transition-all duration-300"
              >
                {item.title}
              </Link>
              {idx < menulist.length - 1 && (
                <LineGradient customClasses="md:my-6 my-4" />
              )}
            </React.Fragment>
          ))}
        </ul>

        <div className="flex flex-nowrap items-center gap-x-3">
          <CustomButton
            label="Login"
            buttonType="primary"
            onClick={() => console.log("Login ")}
            customClasses="w-full text-base!"
          />
          <CustomButton
            label="Sign up"
            buttonType="secondary-outlined"
            onClick={() => console.log("Sign up")}
            customClasses="w-full text-base!"
          />
        </div>
      </nav>
    </Drawer>
  );
};

export default NavBarDrawer;
