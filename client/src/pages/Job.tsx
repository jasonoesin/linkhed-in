import { PlusIcon, XIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/Job.scss";
import binus from "../assets/binus.jpg";
import { useUserContext } from "../components/context/UserContext";

export default function Job() {
  const [jobs, setJobs] = useState([]);
  const [modal, setModal] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = () => {
    axios.get(`http://localhost:8080/job`, {}).then((res) => {
      if (res.data === "") {
        setJobs([]);
        return;
      }
      setJobs(res.data);
    });
  };

  return (
    <div className="page">
      <div className="job">
        <PlusIcon
          onClick={() => {
            setModal(true);
          }}
          className="icon"
        />
        <div className="">Available Jobs</div>

        {jobs &&
          jobs.map((job: any, index) => {
            return (
              <JobComponent
                fetch={fetch}
                modal={{ modal, setModal, user }}
                key={index}
                data={job}
              />
            );
          })}
      </div>
    </div>
  );
}

const JobComponent = (props: any) => {
  return (
    <>
      <div className="job-component">
        <img src={binus} />

        <div className="job-component-desc">
          <div className="name">{props.data?.name}</div>
          <div className="company">{props.data?.company}</div>
          <div className="location">{props.data?.location}</div>
        </div>
      </div>

      {props.modal.modal && (
        <div className="job-modal">
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const json = {
                user: props.modal.user?.id,
                name: e.target.Name.value,
                company: e.target.Company.value,
                location: e.target.Location.value,
              };

              axios.post(`http://localhost:8080/job`, json).then((res) => {
                props.modal.setModal(false);
                props.fetch();
              });
            }}
            className="job-white-box"
          >
            <XIcon
              className="icon"
              onClick={() => {
                props.modal.setModal(false);
              }}
            />
            <div className="title">Add Job</div>
            <label htmlFor="">Job Title</label>
            <input id="Name" type="text" />
            <label htmlFor="">Company</label>
            <input id="Company" type="text" />
            <label htmlFor="">Location</label>
            <input id="Location" type="text" />
            <button>Add</button>
          </form>
        </div>
      )}
    </>
  );
};
