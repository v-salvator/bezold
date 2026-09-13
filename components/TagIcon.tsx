import * as React from "react";
import {
  LikeFilled,
  AlertFilled,
  ClockCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";

import { STORE_TAG } from "@/types";

const TagIcon = ({ tag }: { tag: string }) => {
  switch (tag) {
    case STORE_TAG.EMERGENCY:
      return <ClockCircleFilled style={{ color: "rgb(139 92 246)" }} />;
    case STORE_TAG.CHEAP:
      return <AlertFilled style={{ color: "rgb(253 224 71)" }} />;
    case STORE_TAG.RECOMMENDED:
      return <LikeFilled style={{ color: "rgb(125 211 252)" }} />;
    case STORE_TAG.DETAILED_DATA:
      return <CheckCircleFilled style={{ color: "rgb(34 197 94)" }} />;
    default:
      return null;
  }
};

export default TagIcon;
