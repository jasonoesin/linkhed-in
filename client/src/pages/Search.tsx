import axios from "axios";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Search() {
  const routeParams = useParams();
  useEffect(() => {
    axios
      .get(`http://localhost:8080/search-user`, {
        params: { value: routeParams.query },
      })
      .then((res) => {
        console.log(res);
        console.log(res.data);
      });
  }, []);

  return <div>Search</div>;
}
