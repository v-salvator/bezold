import * as React from "react";
import {
  FireFilled,
  LikeFilled,
  AlertFilled,
  ClockCircleFilled,
} from "@ant-design/icons";

import { STORE_TAG } from "@/types";

const TagIcon = ({ tag }: { tag: string }) => {
  switch (tag) {
    case STORE_TAG.HOT:
      return <FireFilled style={{ color: "rgb(245 158 11)" }} />;
    case STORE_TAG.EMERGENCY:
      return <ClockCircleFilled style={{ color: "rgb(139 92 246)" }} />;
    case STORE_TAG.CHEAP:
      return <AlertFilled style={{ color: "rgb(253 224 71)" }} />;
    case STORE_TAG.RECOMMENDED:
      return <LikeFilled style={{ color: "rgb(125 211 252)" }} />;
    default:
      return null;
  }
};

export default TagIcon;
