"use client";
import { Drawer } from "@mui/material";
import React from "react";
import { menulist } from "./Header";
import Link from "next/link";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import CustomButton from "@/src/components/button/CustomButton";
import { useAuthContext } from "../auth/AuthContext";
import { isAdminUser } from "@/src/utilities/authUtils";

type INavBarDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const NavBarDrawer: React.FC<INavBarDrawerProps> = ({ open, onClose }) => {
  const { setOpenSignup, setOpenLogin, isLoggedIn, username, logoutUser } =
    useAuthContext();
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{
        paper: {
          sx: {
            width: "100%",
          },
        },
      }}
      sx={{
        zIndex: 99,
        "@media(max-width: 1210px)": {
          display: "block",
        },
        "& .MuiDrawer-paper": {
          width: {
            sm: "70%",
            xs: "100%",
          },
        },
      }}
    >
      <nav className="w-full h-full flex flex-col justify-between md:pt-25 pt-22 md:px-13 px-6 md:pb-10 pb-5 bg-opacity-50 overflow-scroll backdrop-blur-lg">
        <ul className="list-none m-0">
          {isLoggedIn && isAdminUser(username) && (
            <>
              <Link
                href="/admin/dashboard/active"
                onClick={onClose}
                className="text-primary font-bold text-base uppercase flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Admin Dashboard
              </Link>
              <LineGradient customClasses="md:my-6 my-4" />
            </>
          )}
          {menulist.map((item, idx) => (
            <React.Fragment key={idx}>
              <Link
                href={item.href}
                onClick={onClose}
                className="text-foreground text-base uppercase hover:font-medium transition-all duration-300"
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
          {isLoggedIn ? (
            <CustomButton
              label="Logout"
              buttonType="primary"
              onClick={() => {
                logoutUser();
                onClose();
              }}
              customClasses="w-full text-base!"
            />
          ) : (
            <>
              <CustomButton
                label="Login"
                buttonType="primary"
                onClick={() => {
                  setOpenLogin(true);
                  onClose();
                }}
                customClasses="w-full text-base!"
              />
              <CustomButton
                label="Sign up"
                buttonType="secondary-outlined"
                onClick={() => {
                  setOpenSignup(true);
                  onClose();
                }}
                customClasses="w-full text-base!"
              />
            </>
          )}
        </div>
      </nav>
    </Drawer>
  );
};

export default NavBarDrawer;
