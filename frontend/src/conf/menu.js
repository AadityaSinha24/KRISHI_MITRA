import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./api";

// fetches the menu from the backend
export const fetchMenu = async () => {
  const res = await api.get("/prompt/menu");
  return res.data.data.menu; // [{ key: "1", label: "..." }, ...]
};

// hook used by the Dashboard
export default function useMenu() {
  const [menu, setMenu] = useState([]);
  const [menuError, setMenuError] = useState("");

  useEffect(() => {
    let active = true;
    fetchMenu()
      .then((m) => active && setMenu(m))
      .catch((err) => active && setMenuError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, []);

  return { menu, menuError };
}