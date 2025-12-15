"use client";

import * as React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function CustomDialog({
  open,
  onClose,
  title,
  description,
  children,
}: CustomModalProps) {
  const [firstWord, ...restWords] = title.split(" ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      aria-labelledby="login-modal"
      aria-describedby="login-screen"
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(1px)",
          },
        },
      }}
      style={{ zIndex: 9999 }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          outline: "none",
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 xl:w-137.5 md:w-112.5 w-87.5">
          <h2 className="text-4xl font-bold text-center">
            <span className="text-yellow-500">{firstWord}</span>{" "}
            {restWords.join(" ")}
          </h2>

          <p className="text-[#9b9a9a] text-[14px] plusJakartaDisplay  text-center mt-1 mb-6">{description}</p>

          <>{children}</>
        </div>
      </Box>
    </Modal>
  );
}
