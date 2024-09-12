"use client";
import { motion } from "framer-motion";

import { Icon } from "~/components/icons/Icon";

export interface CaretIconProps {
  readonly open: boolean;
}

export const CaretIcon = ({ open }: CaretIconProps) => (
  <motion.div key="0" initial={{ rotate: 0 }} animate={{ rotate: open ? 180 : 0 }}>
    <Icon icon="angle-up" size="16px" dimension="height" fit="square" />
  </motion.div>
);
