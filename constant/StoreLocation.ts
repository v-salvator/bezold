import { getTwCities, getTwDistricts } from "@/utils";

export const getStoreCities = () => {
  return getTwCities().map((city) => {
    return {
      label: city,
      value: city,
    };
  });
};

export const getStoreDistrictByCity = (city?: string) => {
  if (!city) return [];
  return getTwDistricts(city).map((district) => {
    return {
      label: district.name,
      value: district.name,
    };
  });
};
