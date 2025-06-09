import React, { PropsWithChildren } from "react";

import ExportIcon from "../assets/icons/export.svg?react";
import PrimaryButton, { IButtonProps } from "./PrimaryButton";

export interface IExportButtonProps extends IButtonProps {}

const ExportButton: React.FC<PropsWithChildren<IExportButtonProps>> = ({ children, ...other }) => {
  return (
    <PrimaryButton startEndorment={<ExportIcon />} variant="neutral" {...other}>
      {children}
    </PrimaryButton>
  );
};

export default ExportButton;
