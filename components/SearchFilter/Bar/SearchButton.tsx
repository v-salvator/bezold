"use client";
import { Button, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useHandleSearch from "../hooks/useHandleSearch";

const SearchButton = () => {
  const { handleSearchClick, isPending } = useHandleSearch();

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: "#e35252",
            algorithm: true, // Enable algorithm
          },
        },
      }}
    >
      <Button
        className="mr-[-7px]"
        shape="circle"
        type="primary"
        size="large"
        loading={isPending}
        icon={<SearchOutlined />}
        onClick={handleSearchClick}
      ></Button>
    </ConfigProvider>
  );
};

export default SearchButton;
