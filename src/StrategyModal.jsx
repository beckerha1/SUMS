import React from "react";
import StrategyContent from "./Strategy";

const StrategyModal = React.memo(({ onClose }) => {
  return <StrategyContent onClose={onClose} />;
});

export default StrategyModal;
