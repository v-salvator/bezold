import taiwanCities from "@/constant/taiwanCities.json";

export const getTwCities = () => {
  return taiwanCities.map((city) => city.name);
};

export const getTwDistricts = (city: string) => {
  return taiwanCities.find((c) => c.name === city)?.districts || [];
};
