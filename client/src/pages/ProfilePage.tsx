import { PencilIcon, PlusIcon, XIcon } from "@heroicons/react/solid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "../components/context/UserContext";
import s from "../styles/ProfilePage.module.scss";
import binus from "../assets/binus.jpg";
import { GetProfilePicture } from "../components/firebase/GetProfilePicture";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import storage from "../../firebase-config";
import bg from "../assets/profile_bg.jpg";
import { useConnectContext } from "../components/context/ConnectContext";
import { PDFExport } from "@progress/kendo-react-pdf";

export default function ProfilePage() {
  const [current, setCurrent] = useState<any>(false);
  const [more, setMore] = useState<any>(false);

  const params = useParams();

  const { user } = useUserContext();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/profile`, {
        params: { nick: params.id },
      })
      .then((res) => {
        setCurrent(res.data);
      });
  }, []);

  const imageChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const id = params.id;
      const file_name = "image.jpg";

      const storageRef = ref(storage, `/profile/${id}/${file_name}`);
      uploadBytesResumable(storageRef, e.target.files[0]).then((s) => {
        getDownloadURL(s.ref).then((downloadURL) => {
          var json = {
            id: current?.id,
            profile_url: downloadURL,
          };

          axios.patch(`http://localhost:8080/user`, json).then((res) => {
            window.location.reload();
          });
        });
      });
    }
  };

  const bgChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const id = params.id;
      const file_name = "bg.jpg";

      const storageRef = ref(storage, `/profile/${id}/${file_name}`);
      uploadBytesResumable(storageRef, e.target.files[0]).then((s) => {
        getDownloadURL(s.ref).then((downloadURL) => {
          var json = {
            id: current?.id,
            background_url: downloadURL,
          };

          axios.patch(`http://localhost:8080/user`, json).then((res) => {
            window.location.reload();
          });
        });
      });
    }
  };

  if (user?.id !== current?.id) {
    // Add View Count
    axios
      .post(`http://localhost:8080/view`, {
        target_id: current?.id,
        current_id: user?.id,
      })
      .then((res) => {});
  }

  const { connects } = useConnectContext();

  const ref: any = React.createRef();

  const downloadPdfDocument = () => {
    if (ref.current) {
      ref.current.save();
    }
  };

  return (
    <PDFExport scale={0.6} paperSize="A4" margin="0.5cm" ref={ref}>
      <div id="download" className="page">
        <div className={s.page_container}>
          <div
            className={`${s.white_box} ${s.profile}`}
            style={{
              backgroundImage: `url(${
                current?.background_url ? current?.background_url : bg
              })`,
            }}
          >
            {user?.id === current.id && (
              <>
                <PencilIcon
                  style={{
                    position: "absolute",
                    width: "2rem",
                    color: "black",
                    background: "white",
                    borderRadius: "1rem",
                    padding: "0.3rem",
                    right: "1rem",
                    top: "1rem",
                    cursor: "pointer",
                  }}
                />
                <input
                  onChange={bgChange}
                  accept="image/*"
                  type="file"
                  style={{
                    position: "absolute",
                    width: "2rem",
                    color: "black",
                    background: "white",
                    borderRadius: "1rem",
                    padding: "0.3rem",
                    right: "1rem",
                    top: "1rem",
                    cursor: "pointer",
                    opacity: "0",
                  }}
                />
                <input
                  onChange={imageChange}
                  accept="image/*"
                  type="file"
                  className={s.profile_pic_input}
                />
              </>
            )}

            <GetProfilePicture
              className={s.profile_image}
              url={current?.profile_url}
            />
            <div className={s.profile_desc}>
              <div className="">{current.name}</div>
              <div
                className=""
                style={{
                  color: "gray",
                }}
              >
                {current.occupation}
              </div>

              {user?.id !== current?.id && (
                <>
                  {connects?.includes(current?.id) ? (
                    <div className={s.profile_connected}>
                      <ProfileMessage />
                      <div className={s.connected}>Connected</div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        const json = {
                          message: "Message Example",
                          from: user?.email,
                          target: current?.id,
                        };

                        axios
                          .post(`http://localhost:8080/request-connect`, json)
                          .then((res) => {
                            console.log(res.data);
                          });
                      }}
                      className={s.profile_connect}
                    >
                      <div className="">Connect</div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={s.moreContainer}>
              <div
                onClick={() => {
                  setMore(!more);
                }}
                className={s.more}
              >
                More
              </div>

              {more && (
                <div className={s.morePop}>
                  <div
                    onClick={() => {
                      setMore(false);
                      downloadPdfDocument();
                    }}
                    className=""
                  >
                    Save profile as PDF
                  </div>
                  <div className="">Block</div>
                  <div className="">Follow</div>
                </div>
              )}
            </div>
          </div>

          {user?.id === current.id && <Analytics data={current}></Analytics>}

          <Experience user={user} data={current} />
          <Education user={user} data={current} />
        </div>
      </div>
    </PDFExport>
  );
}

const ProfileMessage = (props: any) => {
  return <div className="profile-message">Message</div>;
};

const Analytics = (props: any) => {
  const [view, setView] = useState(0);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/view`, {
        params: { target_id: props.data?.id },
      })
      .then((res) => {
        setView(res.data);
      });
  }, [props.data]);

  return (
    <div className={s.white_box}>
      Analytics
      <div className="">{view} Total View</div>
    </div>
  );
};

const ExpData = (props: any) => {
  const [modal, setModal] = useState(false);
  const data = props.data;

  return (
    <>
      <div className={s.eduData}>
        {props.user?.id === props.profile_user.id && (
          <PencilIcon
            onClick={() => {
              setModal(true);
            }}
            className={`${s.plus_icon} ${s.edit_icon}`}
          />
        )}

        <img crossOrigin="anonymous" src={binus} alt="" />
        <div className={s.right}>
          <div className={s.school}>{data.title}</div>
          <div className={s.field}>{data.company}</div>
          <div className={s.field}>{data.type}</div>
          <div className={s.date}>
            <pre className={s.start}>{data.start_year} - </pre>
            <div className={s.end}>{data.end_year}</div>
          </div>
        </div>
      </div>

      {modal && (
        <div className={`${s.eduModal} ${s.extExpModal}`}>
          <div className={`${s.white_box} `}>
            <button
              onClick={() => {
                axios
                  .delete(`http://localhost:8080/experience`, {
                    data: {
                      experience_id: data.experience_id,
                    },
                  })
                  .then((res) => {
                    setModal(false);
                  });
              }}
              className={s.delete}
            >
              Delete Experience
            </button>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();

                if (
                  e.target.Title.value === "" ||
                  e.target.Type.value === "" ||
                  e.target.Company.value === "" ||
                  e.target.start.value === "" ||
                  e.target.end.value === ""
                ) {
                  // Error
                } else {
                  const json = {
                    experience_id: data.experience_id,
                    Title: e.target.Title.value,
                    Type: e.target.Type.value,
                    Company: e.target.Company.value,
                    start_year: parseInt(e.target.start.value),
                    end_year: parseInt(e.target.end.value),
                    user: props.user_id,
                  };

                  axios
                    .patch(`http://localhost:8080/experience`, json)
                    .then((res) => {
                      console.log(res);
                      setModal(false);
                    });
                }
              }}
            >
              <XIcon
                className={s.icon}
                onClick={() => {
                  setModal(false);
                }}
              />

              <div className="">Edit Experience</div>
              <label htmlFor="">Work Title</label>
              <input defaultValue={data.title} id="Title" type="text" />
              <label htmlFor="">Work Type</label>
              <input defaultValue={data.type} id="Type" type="text" />
              <label htmlFor="">Company Name</label>
              <input defaultValue={data.company} id="Company" type="text" />

              <label htmlFor="">Start Year</label>
              <input
                defaultValue={data.start_year}
                id="start"
                type="number"
                min="2000"
                max="2050"
              />
              <label htmlFor="">End Year</label>
              <input
                defaultValue={data.end_year}
                id="end"
                type="number"
                min="2000"
                max="2050"
              />
              <button type="submit">Edit Experience</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const Experience = (props: any) => {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/experience`, {
        params: { id: props.data?.id },
      })
      .then((res) => {
        if (res.data === "Error in reading payload") {
          setData([]);
          return;
        }
        setData(res.data);
      });
  }, [props.data, modal]);

  return (
    <>
      <div className={`${s.white_box} ${s.education}`}>
        Experience
        <div className="">
          {props.user?.id === props.data.id && (
            <PlusIcon
              onClick={() => {
                setModal(true);
              }}
              className={s.plus_icon}
            />
          )}
        </div>
        {data.length === 0 && (
          <div className={s.empty}>No Experience Listed</div>
        )}
        {data.map((obj: any) => {
          return (
            <ExpData
              user={props.user}
              profile_user={props.data}
              user_id={props.data?.id}
              key={obj.experience_id}
              data={obj}
            />
          );
        })}
      </div>

      {modal && (
        <div className={`${s.eduModal} ${s.extExpModal}`}>
          <form
            onSubmit={(e: any) => {
              e.preventDefault();

              if (
                e.target.Title.value === "" ||
                e.target.Type.value === "" ||
                e.target.Company.value === "" ||
                e.target.start.value === "" ||
                e.target.end.value === ""
              ) {
                // Error
              } else {
                const json = {
                  email: props.data.email,
                  Experience: {
                    Title: e.target.Title.value,
                    Type: e.target.Type.value,
                    Company: e.target.Company.value,
                    start_year: parseInt(e.target.start.value),
                    end_year: parseInt(e.target.end.value),
                  },
                };

                console.log(json);

                axios
                  .post(`http://localhost:8080/experience`, json)
                  .then((res) => {
                    console.log(res);
                    setModal(false);
                  });
              }
            }}
            className={`${s.white_box} `}
          >
            <XIcon
              className={s.icon}
              onClick={() => {
                setModal(false);
              }}
            />
            <div className="">Add Experience</div>
            <label htmlFor="">Title</label>
            <input id="Title" type="text" />
            <label htmlFor="">Type</label>
            <input id="Type" type="text" />
            <label htmlFor="">Company</label>
            <input id="Company" type="text" />
            <label htmlFor="">Start Year</label>
            <input id="start" type="number" min="2000" max="2050" />
            <label htmlFor="">End Year</label>
            <input id="end" type="number" min="2000" max="2050" />
            <button type="submit">Add Experience</button>
          </form>
        </div>
      )}
    </>
  );
};

const EduData = (props: any) => {
  const [modal, setModal] = useState(false);
  const data = props.data;

  return (
    <>
      <div className={s.eduData}>
        {props.user?.id === props.profile_user.id && (
          <PencilIcon
            onClick={() => {
              setModal(true);
            }}
            className={`${s.plus_icon} ${s.edit_icon}`}
          />
        )}

        <img crossOrigin="anonymous" src={binus} alt="" />
        <div className={s.right}>
          <div className={s.school}>{data.school}</div>
          <div className={s.field}>{data.field}</div>
          <div className={s.date}>
            <pre className={s.start}>{data.start_year} - </pre>
            <div className={s.end}>{data.end_year}</div>
          </div>
        </div>
      </div>

      {modal && (
        <div className={s.eduModal}>
          <div className={`${s.white_box} `}>
            <button
              onClick={() => {
                axios
                  .delete(`http://localhost:8080/education`, {
                    data: {
                      education_id: data.education_id,
                    },
                  })
                  .then((res) => {
                    setModal(false);
                  });
              }}
              className={s.delete}
            >
              Delete Education
            </button>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();

                if (
                  e.target.school.value === "" ||
                  e.target.field.value === "" ||
                  e.target.start.value === "" ||
                  e.target.end.value === ""
                ) {
                  // Error
                } else {
                  const json = {
                    education_id: data.education_id,
                    School: e.target.school.value,
                    Field: e.target.field.value,
                    start_year: parseInt(e.target.start.value),
                    end_year: parseInt(e.target.end.value),
                    user: props.user_id,
                  };

                  axios
                    .patch(`http://localhost:8080/education`, json)
                    .then((res) => {
                      console.log(res);
                      setModal(false);
                    });
                }
              }}
            >
              <XIcon
                className={s.icon}
                onClick={() => {
                  setModal(false);
                }}
              />
              <div className="">Edit Education</div>
              <label htmlFor="">School</label>
              <input defaultValue={data.school} id="school" type="text" />
              <label htmlFor="">Field of Study</label>
              <input defaultValue={data.field} id="field" type="text" />
              <label htmlFor="">Start Year</label>
              <input
                defaultValue={data.start_year}
                id="start"
                type="number"
                min="2000"
                max="2050"
              />
              <label htmlFor="">End Year</label>
              <input
                defaultValue={data.end_year}
                id="end"
                type="number"
                min="2000"
                max="2050"
              />
              <button type="submit">Edit Education</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const Education = (props: any) => {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/education`, {
        params: { id: props.data?.id },
      })
      .then((res) => {
        if (res.data === "Error in reading payload") {
          setData([]);
          return;
        }
        setData(res.data);
      });
  }, [props.data, modal]);

  return (
    <>
      <div className={`${s.white_box} ${s.education}`}>
        Education
        <div className="">
          {props.user?.id === props.data.id && (
            <PlusIcon
              onClick={() => {
                setModal(true);
              }}
              className={s.plus_icon}
            />
          )}
        </div>
        {data.length === 0 && (
          <div className={s.empty}>No Education Listed</div>
        )}
        {data.map((obj: any) => {
          return (
            <EduData
              user={props.user}
              profile_user={props.data}
              user_id={props.data?.id}
              key={obj.education_id}
              data={obj}
            />
          );
        })}
      </div>

      {modal && (
        <div className={s.eduModal}>
          <form
            onSubmit={(e: any) => {
              e.preventDefault();

              if (
                e.target.school.value === "" ||
                e.target.field.value === "" ||
                e.target.start.value === "" ||
                e.target.end.value === ""
              ) {
                // Error
              } else {
                const json = {
                  email: props.data.email,
                  Education: {
                    School: e.target.school.value,
                    Field: e.target.field.value,
                    start_year: parseInt(e.target.start.value),
                    end_year: parseInt(e.target.end.value),
                  },
                };

                console.log(json);

                axios
                  .post(`http://localhost:8080/education`, json)
                  .then((res) => {
                    console.log(res);
                    setModal(false);
                  });
              }
            }}
            className={`${s.white_box} `}
          >
            <XIcon
              className={s.icon}
              onClick={() => {
                setModal(false);
              }}
            />
            <div className="">Add Education</div>
            <label htmlFor="">School</label>
            <input id="school" type="text" />
            <label htmlFor="">Field of Study</label>
            <input id="field" type="text" />
            <label htmlFor="">Start Year</label>
            <input id="start" type="number" min="2000" max="2050" />
            <label htmlFor="">End Year</label>
            <input id="end" type="number" min="2000" max="2050" />
            <button type="submit">Add Education</button>
          </form>
        </div>
      )}
    </>
  );
};
