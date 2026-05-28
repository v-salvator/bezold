"use client";
import { Button } from "antd";
import { getStores } from "@/firebase/clientUtils";

const generate = async () => {
  getStores();
};

export default function Operation() {
  return (
    <div>
      operation
      <Button onClick={generate}>gen</Button>
    </div>
  );
}
