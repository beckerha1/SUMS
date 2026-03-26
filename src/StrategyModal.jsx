import React from "react";
import StrategyContent from "./Strategy";

const StrategyModal = React.memo(({ onClose }) => {
  return <StrategyContent modal onClose={onClose} />;
});

export default StrategyModal;
